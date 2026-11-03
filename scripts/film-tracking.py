"""Original SuperBrain offline planar tracking. OpenCV is an optional local dependency."""
import sys, json, math
try:
    import cv2
    import numpy as np
except ImportError:
    sys.exit('Film tracking needs a Python environment with opencv-python-headless and numpy. Set SUPERBRAIN_TRACKING_PYTHON to that Python; no installation was attempted.')


def track(config):
    cv2.setRNGSeed(731)
    cv2.setNumThreads(1)
    capture = cv2.VideoCapture(config['input'])
    if not capture.isOpened():
        raise ValueError('OpenCV could not decode the selected local film')
    try:
        fps = float(capture.get(cv2.CAP_PROP_FPS))
        if not math.isfinite(fps) or fps <= 0:
            raise ValueError('Film has no usable frame rate')
        success, first = capture.read()
        if not success:
            raise ValueError('Film contains no decoded frame')
        height, width = first.shape[:2]
        scale = min(1., config['maxWidth'] / width)
        size = (max(2, round(width*scale)), max(2, round(height*scale)))
        reference = cv2.cvtColor(cv2.resize(first, size), cv2.COLOR_BGR2GRAY)
        source_quad = np.float32(config['quad']) * np.float32(size)
        mask = np.zeros(reference.shape, dtype=np.uint8)
        cv2.fillConvexPoly(mask, np.int32(source_quad), 255)
        detector = cv2.ORB_create(nfeatures=2500, scaleFactor=1.15, nlevels=10, edgeThreshold=12, fastThreshold=9)
        keys, descriptors = detector.detectAndCompute(reference, mask)
        if descriptors is None or len(keys) < 12:
            raise ValueError('Selected surface has fewer than 12 usable image features. Choose a textured plane, a larger quad or another source film.')
        matcher = cv2.BFMatcher(cv2.NORM_HAMMING)
        frames = []
        duration = config['duration']
        step = max(1, round(fps/config['sampleFps']))
        count = 0
        current = first
        timestamp_fallback = False
        last_time = -1.
        while True:
            if count % step == 0:
                reported = float(capture.get(cv2.CAP_PROP_POS_MSEC))/1000.
                if math.isfinite(reported) and reported >= 0 and (count == 0 or reported > last_time):
                    time = reported
                else:
                    time = count/fps
                    timestamp_fallback = True
                if time <= last_time:
                    raise ValueError('Decoder returned non-monotonic timing. Prepare constant-frame-rate delivery media before tracking.')
                last_time = time
                if time > duration + .1:
                    break
                gray = cv2.cvtColor(cv2.resize(current, size), cv2.COLOR_BGR2GRAY)
                target_keys, target_descriptors = detector.detectAndCompute(gray, None)
                good = []
                if target_descriptors is not None and len(target_keys) >= 2:
                    pairs = matcher.knnMatch(descriptors, target_descriptors, k=2)
                    good = [pair[0] for pair in pairs if len(pair)==2 and pair[0].distance < .72*pair[1].distance]
                record = {'time':round(min(duration,time),7), 'at':round(min(1.,time/duration),8), 'quad':None, 'confidence':0, 'state':'lost', 'matches':len(good), 'inliers':0, 'errorPx':None}
                if len(good) >= 10:
                    source_points = np.float32([keys[m.queryIdx].pt for m in good])
                    target_points = np.float32([target_keys[m.trainIdx].pt for m in good])
                    matrix, inlier_mask = cv2.findHomography(source_points, target_points, cv2.RANSAC, 2.5, maxIters=3000, confidence=.995)
                    if matrix is not None and inlier_mask is not None and np.isfinite(matrix).all():
                        inlier_mask = inlier_mask.ravel().astype(bool)
                        inliers = int(inlier_mask.sum())
                        ratio = inliers/len(good)
                        predicted = cv2.perspectiveTransform(source_points.reshape(-1,1,2),matrix).reshape(-1,2)
                        error = float(np.median(np.linalg.norm(predicted[inlier_mask]-target_points[inlier_mask],axis=1))) if inliers else 1e9
                        projected = cv2.perspectiveTransform(source_quad.reshape(-1,1,2),matrix).reshape(4,2)
                        area = abs(cv2.contourArea(projected))
                        original_area = abs(cv2.contourArea(source_quad))
                        sane = np.isfinite(projected).all() and cv2.isContourConvex(projected) and original_area*.05 < area < original_area*12 and np.abs(projected/np.float32(size)).max() < 3
                        record.update(inliers=inliers,errorPx=round(error/scale,4))
                        if inliers >= 10 and ratio >= config['minConfidence'] and error <= 2.5 and sane:
                            record.update(quad=np.round(projected/np.float32(size),8).tolist(),confidence=round(ratio,5),state='tracked')
                frames.append(record)
            count += 1
            success, current = capture.read()
            if not success:
                break
        if len(frames)<2:
            raise ValueError('Film needs at least two sampled frames')
        # Each measurement names an actual decoded frame. Last-sample hold handles the tail.
        return {'frames':frames,'algorithm':{'name':'ORB-reference-RANSAC-homography','opencv':cv2.__version__,'referenceFrame':0,'referenceFeatures':len(keys),'sampleFps':fps/step,'analysisWidth':size[0],'seed':731,'timestampSource':'OpenCV decoded presentation position (POS_MSEC)' if not timestamp_fallback else 'decoded presentation position with frame-index / declared-fps fallback','timingLimit':'Track prepared constant-frame-rate delivery media; a decoder without timestamps uses declared-frame-rate timing.','cameraModel':'Projective motion of one selected plane; not full 3D camera reconstruction.'}}
    finally:
        capture.release()


if __name__=='__main__':
    try:
        config=json.loads(sys.stdin.read())
        print(json.dumps(track(config),allow_nan=False,separators=(',',':')))
    except Exception as error:
        sys.exit(str(error))
