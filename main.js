/* ==========================================================================
   VEDANTH RAJ · PORTFOLIO
   js/data.js        → your content (projects, flows, roles, highlights)
   js/sections.js    → interactive widgets for each page
   js/background.js  → scroll-scrubbed video (blurred) + hero cutout
   js/build.js       → the live "build" intro (cursors, typing, frames)
   js/robot.js       → Vee, the robot the cursors assemble into (chatbot)
   js/knowledge.js   → everything Vee knows about you (edit to update answers)
   The previous design is kept in /_previous-design.
   ========================================================================== */
import { initBackground } from './js/background.js';
import { initSections, tick } from './js/sections.js';
import { initBuild } from './js/build.js';
import { initRobot } from './js/robot.js';
import { initPortal } from './js/portal.js';

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
if (!location.hash) window.scrollTo(0, 0);

initBackground();
const sections = initSections(); // renders cards first, so the build sees them
initPortal(); // "Enter another world": the game mode, Vedanth's City (city.html)
const robot = initRobot({ tick });
initBuild({ onPageBuilt: (page) => sections.onPageBuilt(page), tick, robot });
