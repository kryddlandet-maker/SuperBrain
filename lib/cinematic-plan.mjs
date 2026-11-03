// Original SuperBrain planning contracts. A plan records implementation work;
// it neither generates media nor authorizes a purchase.
export function wantsCinematicMotion(brief){
  const text=[brief.task,brief.goal,brief.direction,...(brief.references||[]).flatMap(ref=>ref.observations||[])].filter(Boolean).join(' ');
  return brief.techniques?.includes('cinematic')||/scroll[ -]?(?:video|film)|scroll[ -]?(?:styrd|driven|drivet)?[ -]+(?:video|film)|(?:cinematic|filmisk|filmiskt|filmiska)[ -]+(?:hero|öppning|opening|scroll(?:sajt|sida|site)?|webbplats|website|site)|video[ -]scrub/i.test(text);
}

export function planCinematicMotion(brief,mode){
  if(mode==='quick-edit'||!wantsCinematicMotion(brief))return null;
  const staticFirst=brief.motion==='quiet'||(brief.preferences?.motionIntensity??5)<=2;
  return {
    schema:1,pattern:'scroll-film',goal:brief.goal,
    scope:'An optional film scene; preserve the page task, working navigation and direct access to the content after it.',
    playback:staticFirst?'static-first':'scroll',
    storyboard:[
      {at:0,beat:'establish',cue:'Identify the subject and opening state in the selected source.',copy:null},
      {at:.35,beat:'change',cue:'Show the story event; keep its action clear of the text.',copy:null},
      {at:.72,beat:'result',cue:'Let the visitor understand the consequence and read the headline.',copy:null},
      {at:1,beat:'settle',cue:'Reach a composed ending with an available next action.',copy:null}
    ],
    typography:{driver:'presented-media-time',domain:'Normalized decoded media time from 0 to 1; finalize cues against the actual delivery film.',method:'Author keyframes for dedicated text layers; interpolation is deterministic in either scroll direction.',tracking:'Optional measured planar tracking uses scripts/film-tracking.mjs and examples/shared/film-surface.js; track the final encoded delivery film and reject lost intervals.',semantics:'Keep real headings and links in HTML; motion decorates their dedicated inner layers.'},
    implementation:{module:'examples/shared/cinematic.js',installedModule:'.superbrain/examples/shared/cinematic.js',example:'/examples/cinematic-media/',installedExample:'.superbrain/examples/cinematic-media/',guide:'cinematic-media',initializer:'initCinematicScene'},
    accessibility:{staticFirst,staticComposition:'Use an intentional poster, readable headline and the same primary action before JavaScript and when media fails.',escape:'Provide a normal skip link to the next section.',reducedMotion:'Start still without fetching the film; local motion is an explicit choice.'},
    production:{
      schema:1,status:'unprepared',
      assets:{
        wide:{source:null,delivery:null,poster:null,sourceVersion:null,status:'missing'},
        portrait:{source:null,delivery:null,poster:null,sourceVersion:null,status:'missing',treatment:'Choose a reviewed crop, a separately composed film or an intentional still.'}
      },
      generation:{provider:null,models:null,approvedBudget:null,currency:null,actualSpend:null,approval:null},
      dependencies:[
        {from:'selected source film',to:['wide delivery','portrait treatment','posters','typography cues','review evidence']},
        {from:'approved copy',to:['wide typography','portrait typography','static composition']}
      ],
      invariants:['Record the real subject, materials, geometry and verified claims that must survive media revisions.','Give every selected source and delivery variant an identifiable version.','A source replacement reopens review of its dependent variants, cue times and posters.'],
      spending:'Use existing authorized media first. When external generation is requested, record a concrete provider quote, approved allowance and actual spend separately. No provider, model, purchase or budget is selected by this plan.'
    },
    acceptance:[
      {check:'forward-reverse-jump',evidence:'Observe the actual film and text after forward, reverse and arbitrary seeks on desktop and portrait layouts.'},
      {check:'source-identity',evidence:'Record the played delivery filename/version, actual decoded time and corresponding typography cue.'},
      {check:'failure-and-reduced-motion',evidence:'Confirm the still, heading, primary action and skip link with failed media, reduced motion and no JavaScript.'},
      {check:'lifecycle',evidence:'Verify offscreen/hidden suspension, explicit local motion choice and teardown before reinitialization.'},
      {check:'whole-film',evidence:'Inspect a timestamped contact sheet and complete playback; a still sheet alone cannot establish smooth motion.'}
    ],
    status:'Implementation proposal; source media, authored copy, encoding and browser evidence are still required.'
  };
}
