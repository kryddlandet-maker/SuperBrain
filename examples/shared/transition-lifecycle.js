// Native cross-document transitions may be skipped while navigation still succeeds.
// Handle only the documented opt-out rejection, never application errors.
// https://developer.chrome.com/docs/web-platform/view-transitions/cross-document
const observeTransition = event => {
 const transition = event.viewTransition;
 if (!transition) return;
 transition.ready.catch(error => {
  if (error?.name !== 'InvalidStateError' || !error.message.includes('ViewTransition opt-in disabled')) throw error;
 });
};
const attach = () => {
 window.addEventListener('pageswap', observeTransition);
 window.addEventListener('pagereveal', observeTransition);
};
const detach = () => {
 window.removeEventListener('pageswap', observeTransition);
 window.removeEventListener('pagereveal', observeTransition);
};
attach();
window.addEventListener('pagehide', detach);
window.addEventListener('pageshow', event => {if (event.persisted) attach();});
