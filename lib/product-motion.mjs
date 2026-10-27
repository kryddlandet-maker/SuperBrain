// Original scene contracts. These describe work to build, not a generated application.
const patterns = {
  workflow: {
    title: 'Show one product task moving through the interface',
    anchors: ['Window frame', 'Column headings', 'Task subject'],
    beats: ['Hold a legible initial task', 'Move the task into its next state', 'Reveal the visible consequence', 'Hold the result, then reset quietly'],
    recipe: 'Animate dedicated inner DOM layers with one shared WAAPI timeline; keep the real controls and labels stationary.'
  },
  orbit: {
    title: 'Show a family of connected capabilities',
    anchors: ['Central product mark', 'Frame bounds', 'Capability labels'],
    beats: ['Show the complete capability set', 'Lift and separate the icon layers', 'Gather attention around the central capability', 'Settle back without a jump'],
    recipe: 'Use original SVG/DOM icons and bounded transform tracks; use an authored video only when the requested material needs an actual render.'
  },
  timeline: {
    title: 'Show input becoming an edited result',
    anchors: ['Editor frame', 'Timeline track names', 'Preview crop'],
    beats: ['Show source clips', 'Advance a playhead through the edit', 'Reveal the resulting sequence', 'Hold the result before a seamless reset'],
    recipe: 'Coordinate clip transforms, playhead and result opacity on a shared timeline; use licensed muted video for photographic footage.'
  }
};
export function wantsProductMotion(brief) {
  const text=[brief.task,brief.goal,brief.direction,...(brief.references||[]).flatMap(r=>r.observations||[])].filter(Boolean).join(' ');
  return brief.techniques?.includes('scenes') || /product (?:animation|demo|motion)|animated (?:product|feature|card)|feature (?:animation|demo)|bento (?:animation|motion)|animerad[ea]? (?:produkt|kort)|produktanimation|levande (?:produkt|kort)|rörliga (?:kort|rutor)|aktiva animationer/i.test(text);
}
export function planProductMotion(brief, mode) {
  if(!wantsProductMotion(brief))return null;
  const text=[brief.task,brief.goal,brief.direction,...(brief.references||[]).flatMap(r=>r.observations||[])].filter(Boolean).join(' ');
  const pattern=/timeline|video|editing|redigering|tidslinje/i.test(text)?'timeline':/orbit|icon|ikon|capabilit/i.test(text)?'orbit':'workflow';
  return {
    schema:1,pattern,...patterns[pattern],scope:mode==='quick-edit'?'Affected scene only; preserve surrounding layout, typography, routes and working actions.':'One representative feature scene; adapt it to the actual product before adding more.',
    goal:brief.goal,content:'Use verified product UI or label the scene as a fictional demonstration. A demo state is never a real submitted task.',
    durationMs:7200,playback:brief.motion==='quiet'||(brief.preferences?.motionIntensity??5)<=2?'manual':'visible-auto',
    timing:[{at:0,beat:'establish'},{at:.18,beat:'act'},{at:.56,beat:'consequence'},{at:.8,beat:'hold'},{at:1,beat:'reset'}],
    lifecycle:['Pause offscreen and while the document is hidden','Keep manual pause until the user resumes','Use a legible still under reduced motion; explicit local playback is available','Cancel animations and disconnect observers on unmount'],
    implementation:{module:'examples/shared/product-motion.js',installedModule:'.superbrain/examples/shared/product-motion.js',example:'/examples/product-motion/',installedExample:'.superbrain/examples/product-motion/',guide:'product-motion',media:'DOM/SVG first for editable interface motion; choose video, Rive, Lottie or WebGL from the actual visual and available assets.'},
    acceptance:['Observe initial, intermediate, result and reset frames','Test pause/resume, offscreen return and live motion preference changes','Test 320px mobile and desktop with real labels and crops','Verify keyboard controls and the no-JavaScript still'],
    status:'Implementation proposal; verify the consuming project in a browser'
  };
}
