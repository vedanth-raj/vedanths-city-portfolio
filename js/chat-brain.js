/* ==========================================================================
   VEE'S BRAIN · a small on-page language engine
   No server needed: it normalises the question, forgives typos, spots
   projects / roles / skills, keeps track of what "it" refers to, scores
   intents and answers from js/knowledge.js. Anything it doesn't know, it
   says so and points to Vedanth (it never invents facts).
   Replies: { text, chips?, actions? }  ·  text supports **bold**, [link](url), "- " lists
   ========================================================================== */

import { ME, ROLES, PROJECTS, SKILLS, AWARDS, LEADERSHIP, CERTS, PAPER, HOBBIES, COURSEWORK } from './knowledge.js';

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const MAIN = PROJECTS.filter((p) => p.how && p.id !== 'site');
const SMALL = PROJECTS.filter((p) => !p.how && p.id !== 'site');
const mail = `[${ME.email}](mailto:${ME.email})`;
const CONTACT_ACTIONS = [
  { label: 'Email him', href: `mailto:${ME.email}` },
  { label: 'LinkedIn', href: ME.linkedin },
  { label: "Open 'Let's talk'", open: 'talk' },
];

/* ---------------- text utils ---------------- */
export const norm = (s) => ` ${String(s).toLowerCase()
  .replace(/[’‘`]/g, "'")
  .replace(/[^a-z0-9+#.'\s_-]/g, ' ')
  .replace(/(\w)'s\b/g, '$1')
  .replace(/\.(?=\s|$)/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()} `;

const words = (n) => n.trim().split(' ').filter(Boolean);

// optimal string alignment distance (typos incl. swapped letters)
function osa(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) d[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// does the normalised question mention this alias? (exact phrase, plural, or a close typo)
function has(n, alias, toks) {
  if (n.includes(` ${alias} `) || n.includes(` ${alias}s `)) return 3;
  if (alias.includes(' ') || alias.length < 6) return 0;
  const lim = alias.length >= 9 ? 2 : 1;
  return toks.some((t) => t.length >= 4 && osa(t, alias) <= lim) ? 1 : 0;
}

function findAll(n, list, aliasesOf) {
  const toks = words(n);
  const out = [];
  list.forEach((item) => {
    let best = 0;
    let len = 0;
    aliasesOf(item).forEach((a) => {
      const s = has(n, a, toks);
      if (s > best || (s === best && s > 0 && a.length > len)) { best = s; len = a.length; }
    });
    if (best) out.push({ item, score: best * 10 + len });
  });
  return out.sort((a, b) => b.score - a.score).map((o) => o.item);
}

/* ---------------- intents ---------------- */
const INTENTS = [
  ['greet', [[/^ (hi+|hello+|hey+|hiya|yo|sup|hola|namaste|howdy|greetings|hai)\b/, 3], [/^ good (morning|afternoon|evening|day)\b/, 3]]],
  ['howareyou', [[/how (are|r) (you|u)|how's it going|how is it going|how are things|how do you do|what's up|whats up|what up|wassup|how it going/, 3.2]]],
  ['thanks', [[/\b(thanks|thank you|thank u|thx|ty|cheers|appreciate it|appreciated)\b/, 3]]],
  ['bye', [[/\b(bye|goodbye|good bye|see you|see ya|cya|talk later|good night|gotta go)\b/, 3]]],
  ['bot', [[/(who|what) are (you|u)\b|your name|are you (a |an )?(bot|robot|ai|human|real|chatgpt|gpt|person)|who (made|built|created) you|what is vee|who is vee|how do you work/, 3.4]]],
  ['help', [[/what can (you|i) (do|ask)|what do you know|^ help |how does this work|what should i ask|options|menu/, 2.6]]],
  ['about', [[/(who is|who's|tell me about|introduce|describe|about) (vedanth|him|raj|the developer|this guy|this person)|who is he|elevator pitch|^ (summary|overview|bio|profile|background) |quick summary|in short|tl;?dr|summari[sz]e (him|his)/, 3.2], [/\bvedanth\b/, 0.6]]],
  ['recruiter', [[/\b(i'm a recruiter|i am a recruiter|recruiter here|hiring manager|talent acquisition|headhunter|i'm hiring|we're hiring|we are hiring|i am hiring|from hr|hr here)\b/, 3.5], [/\brecruit(er|ers|ing)\b/, 2.6]]],
  ['education', [[/(educat|studies|studying|study|college|universit|degree|b ?tech|bachelor|major|nmims|stme|school|graduat|semester|which year|what year|batch|coursework|courses|subjects)/, 2.6]]],
  ['cgpa', [[/(cgpa|\bgpa|grades?|marks|percentage|academics|academic performance)/, 3.2]]],
  ['skills', [[/(skills?|skill ?set|tech ?stack|technolog|toolkit|tools does|expertise|proficien|strongest at|good at|languages does he (code|program|know)|programming languages|what does he know|what can he do)/, 2.4], [/\bstack\b/, 2]]],
  ['projects', [[/(projects?|what has he (built|made|done)|things he (built|made)|work samples|portfolio pieces|apps he|systems he|show me (his )?work)/, 2.3]]],
  ['best', [[/(best|favou?rite|proudest|most impressive|flagship|strongest|standout|coolest|top|biggest|main) (project|projects|work|build|thing)/, 3.4], [/(proud of|most complex|hardest project)/, 3]]],
  ['experience', [[/(experience|intern\b|interns|internship|worked (at|for|with)|work history|jobs?|companies|employ|career|professional)/, 2.4]]],
  ['current', [[/(currently|right now|these days|current (role|job|position)|now doing|what is he doing now|what does he do now)/, 2.6]]],
  ['awards', [[/(award|achiev|\bwins?\b|\bwon\b|prize|competition|accomplish|first place|1st place|drone conquest|recogni[sz])/, 2.8]]],
  ['leadership', [[/(leadership|\blead\b|\bleads\b|led |club|committee|\bhead\b|organi[sz]|\bfest\b|kaunyak|sponsor|team ?work|teams|managed|mentor)/, 2.4]]],
  ['research', [[/(research|paper|publication|publish|researchgate|journal|thesis)/, 2.6]]],
  ['certs', [[/(certif|credential|aws academy|cisco|courses? (has he|did he) (done|taken))/, 3]]],
  ['email', [[/(e-?mail|mail id|email id|email address|\bmail\b)/, 3.2]]],
  ['phone', [[/(phone|number|call him|whatsapp|mobile number|contact number)/, 3.2]]],
  ['linkedin', [[/linked ?in/, 3.4]]],
  ['github', [[/(github|git hub|\brepo|source code|\bcode\b)/, 2.6]]],
  ['contact', [[/(contact|reach (him|out)|get in touch|talk to (him|vedanth)|connect with|how (do|can) i (hire|meet|reach)|socials?|schedule|interview him|book a call|set up a call)/, 2.8]]],
  ['resume', [[/(resume|résumé|\bcv\b|curriculum vitae)/, 3.4]]],
  ['location', [[/(where (is|does) he (live|based|from|stay|located)|location|located|which city|based in|where is he|hometown|country|relocat|\bremote\b|onsite|on-site|hybrid|move to)/, 2.8]]],
  ['availability', [[/(availab|open to|looking for|free to|notice period|start date|when can he (start|join)|full[ -]?time|part[ -]?time|freelanc|opportunit|internships? (now|open)|is he hiring|can he join|can we hire|is he free)/, 2.8]]],
  ['why', [[/(why (should|would|do) (i|we|you)|why hire|why him|what makes him|stand ?out|unique|strengths?|good fit|right fit|fit for|what value|convince me|sell me|pitch him)/, 3.3]]],
  ['weakness', [[/(weakness|weak point|weak at|areas? (of|for|to) improve|shortcoming|what is he bad at|needs to improve)/, 3.4]]],
  ['hobbies', [[/(hobb|free time|spare time|for fun|interests?|passion|outside (of )?work|outside class|sports?|personal life)/, 2.6]]],
  ['cloud', [[/(cloud|\baws\b|amazon web|serverless|devops)/, 1.8]]],
  ['ai', [[/(\bai\b|\bml\b|machine learning|deep learning|computer vision|\bgenai\b|generative|\bllms?\b|\bnlp\b|neural|artificial intelligence|data science)/, 1.8]]],
  ['web', [[/(web ?dev|full[ -]?stack|frontend|front[ -]end|backend|back[ -]end|web apps?)/, 1.9]]],
  ['mobile', [[/(mobile|flutter|android|\bios\b|app dev)/, 2.4]]],
  ['data', [[/(data analy|analytics|power bi|dashboards?|visuali[sz]|business intelligence)/, 2]]],
  ['salary', [[/(salary|\bctc\b|compensation|\bpay\b|stipend|expected package|package|hourly rate|how much (does he|would he) (charge|cost|want))/, 3.4]]],
  ['time', [[/(what time|time is it|his time|time (there|in india|in hyderabad)|timezone|time zone|\bist\b|working hours)/, 3]]],
  ['joke', [[/(joke|make me laugh|something funny|fun fact)/, 3.4]]],
  ['age', [[/(how old|\bage\b|birthday|date of birth|born)/, 3.2]]],
  ['spoken', [[/(speak|spoken|languages does he speak|english|hindi|telugu)/, 2.4], [/(communicat|soft skills|presentation)/, 2.8]]],
  ['compliment', [[/(you'?re (so )?(cute|adorable|awesome|cool|great|smart|helpful|amazing)|love you|good bot|nice bot|so cute|cute bot|good job|well done)/, 3.4]]],
  ['insult', [[/(stupid|dumb|useless|idiot|you suck|hate you)/, 3]]],
  ['city', [[/(vedanth'?s? city|game mode|another world|gta|driving|car game|drive through)/, 3.4]]],
  ['site', [[/(cursors?|who (built|made|designed) this|how (was|is) this (site |page |website )?(made|built)|how did he (make|build) this)/, 3.2]]],
  ['yes', [[/^ (yes|yeah|yea|yep|yup|sure|ok|okay|okey|please|go ahead|do it|y|ya|absolutely|definitely|sounds good)\b/, 1.2]]],
  ['no', [[/^ (no|nope|nah|not now|no thanks|nevermind|never mind|n)\b/, 1.2]]],
  ['more', [[/^ (more|tell me more|go on|continue|elaborate|and|details?|explain|expand|keep going|what else)\b|tell me more|more (about|details|info)|anything else|what else/, 1.6]]],
];

function scoreIntents(n) {
  return INTENTS.map(([id, rules]) => ({ id, s: rules.reduce((t, [re, w]) => t + (re.test(n) ? w : 0), 0) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s);
}

const FACETS = [
  ['stack', /(stack|tech\b|technolog|built (with|using|on)|made (with|using)|languages?|framework|tools?|libraries|what did (he|it) use|uses?\b|used\b)/],
  ['how', /(how|architecture|pipeline|design|flow|under the hood|works?\b|working|explain|walk me through|system)/],
  ['impact', /(result|impact|accura|metric|numbers?|performance|fast|latency|outcome|scale|users|achiev|precision)/],
  ['challenge', /(challeng|hard|difficult|problem|learn|lesson|tricky|issue|obstacle)/],
  ['link', /(github|code|repo|source|link|demo|live|see it|try it)/],
];
const facetOf = (n) => (FACETS.find(([, re]) => re.test(n)) || [null])[0];
const SKILL_Q = /(does he|is he|can he|has he|did he|do you know if he|is vedanth|does vedanth|can vedanth|has vedanth).*(know|use|work|familiar|experience|code|program|good|proficient|skilled|expert|handle|done|built)|\b(knows?|familiar with|experience (with|in)|worked (with|on)|proficient (in|with)|skilled (in|at)|good (at|with)|expert in|used)\b/;

/* ---------------- answer builders ---------------- */
const projectChips = (p) => {
  const others = MAIN.filter((x) => x.id !== p.id);
  return [p.how ? `How does ${short(p)} work?` : null, p.stack ? `What stack did it use?` : null, `Tell me about ${short(pick(others))}`].filter(Boolean);
};
const short = (p) => ({ face: 'Face Auth', recipe: 'the Recipe Generator', hospital: 'Smart Hospital', aquaflow: 'AquaFlow', litwise: 'LitWise AI', anpr: 'ANPR' }[p.id] || p.name);

function projectAnswer(p, facet, ctx) {
  ctx.facetsSeen = ctx.last?.item === p ? ctx.facetsSeen : new Set();
  if (!facet) facet = ctx.last?.item === p ? ['how', 'impact', 'challenge', 'stack'].find((f) => !ctx.facetsSeen.has(f) && p[f]) : null;
  ctx.last = { type: 'project', item: p };
  const chips = projectChips(p);
  const scroll = p.id === 'site' ? [] : [{ label: 'Show me on the page', scroll: '#work' }];
  if (facet) ctx.facetsSeen.add(facet);
  if (facet === 'stack' && p.stack) return { text: `**${p.name}** is built with:\n${p.stack.map((s) => `- ${s}`).join('\n')}`, chips };
  if (facet === 'how' && p.how) return { text: p.id === 'site' ? `Here's how this site was built: ${p.how} ${p.one}` : `Here's how **${p.name}** works: ${p.how}`, chips };
  if (facet === 'impact') return { text: p.impact ? `${p.impact}` : `${p.one} I don't have hard numbers for this one, so ask Vedanth for details: ${mail}.`, chips };
  if (facet === 'challenge') return { text: p.challenge || `${p.one} I don't know the war stories for this one. Vedanth would love to tell you himself: ${mail}.`, chips };
  if (facet === 'link') return { text: `His code lives on GitHub: [github.com/vedanth-raj](${ME.github}). Some client work (like AquaFlow) is private, so just ask him for a walkthrough.`, actions: [{ label: 'Open GitHub', href: ME.github }], chips };
  if (!p.how) {
    return { text: `**${p.name}**: ${p.one}${p.stack ? ` (${p.stack.join(', ')})` : ''}`, chips: ['What are his best projects?', 'More projects', 'What are his skills?'] };
  }
  return { text: `**${p.name}**: ${p.one} ${p.impact || ''}`.trim(), chips, actions: scroll };
}

function roleAnswer(r, ctx, deeper = false) {
  const again = ctx.last?.item === r;
  ctx.last = { type: 'role', item: r };
  if (deeper || again) return { text: r.more, chips: ['What projects has he built?', 'Other experience', 'How do I contact him?'] };
  const extra = r.id === 'aws' ? `\n\nOn the build side, his flagship AWS project is the **AI Recipe Generator** (Bedrock, 5 Lambdas, 7 AWS services in CloudFormation).` : '';
  return { text: `**${r.role}** at **${r.org}** (${r.when}). ${r.what}${extra}`, chips: ['Tell me more', 'Other experience', r.id === 'aws' ? 'Tell me about the Recipe Generator' : 'What are his skills?'] };
}

function skillAnswer(list) {
  const s = list.slice(0, 3);
  if (s.length === 1) {
    return {
      text: pick([`Yes! He uses **${s[0].n}**, most notably in ${s[0].w}.`, `He's worked with **${s[0].n}** in ${s[0].w}.`, `**${s[0].n}** is in his toolkit. You'll find it in ${s[0].w}.`]),
      chips: ['What else is in his stack?', 'What are his best projects?'],
    };
  }
  return { text: `Yes to all of those:\n${s.map((k) => `- **${k.n}**: ${k.w}`).join('\n')}`, chips: ['What else is in his stack?', 'Why should I hire him?'] };
}

const STACK_TEXT = `Here's his stack, layer by layer:
- **AI / ML**: computer vision (OpenCV, YOLOv10n, MTCNN, Dlib, ResNet-50), deep learning, GenAI and LLM apps, NLP, FAISS, Scikit-learn, TensorFlow
- **Cloud (AWS)**: Lambda, Bedrock, API Gateway, Cognito, DynamoDB, S3/CloudFront, CloudFormation, CloudWatch, IAM, EC2, SNS
- **Backend**: Python, Node.js, Flask, Django, REST APIs, JWT auth, Socket.io
- **Frontend & mobile**: React, Next.js, Tailwind, HTML/CSS, Vite, Flutter
- **Data**: MongoDB, MySQL, PostgreSQL, DynamoDB, Firebase, Power BI, Pandas, NumPy
- **Languages**: Python, SQL, C++, JavaScript, TypeScript (basics of Java)`;

const ABOUT = () => `**${ME.name}** is ${ME.pitch}\n\nQuick numbers: ${ME.stats}. Right now he's an **AWS Student Builder Campus Leader**, and he has interned at **Infosys**, **InnoByte**, **Gudsky Research** and **Espiratia**.`;

const PITCH = `Here's the 30-second pitch:
- **Ships real systems**: 15+ built, including a 7-service serverless GenAI app on AWS and a 98.5%-accurate real-time face-auth pipeline at ~50 ms
- **Full range**: computer vision, cloud and full-stack, so he can own a feature end to end
- **Proven with real users**: AquaFlow runs memberships for Indian Railways
- **Leads and teaches**: AWS Student Builder Campus Leader, Robotics Club head, raised ₹1.5L+ for a university fest
- **Experience**: 4+ internships, including full-stack work at Infosys`;

const H = {
  greet: (ctx) => ({ text: pick([`Hey${ctx.name ? ` ${ctx.name}` : ''}! 👋 I'm Vee. What would you like to know about Vedanth?`, `Hi there! I'm Vee, Vedanth's pocket robot. Ask me about his projects, experience or skills.`, `Hello! Beep boop, ready to help. Projects, skills, experience, contact: what are you after?`]), chips: ['Who is Vedanth?', 'Best projects', 'Why should I hire him?'] }),
  howareyou: () => ({ text: pick(["Fully charged and floating! ⚡ Thanks for asking. What can I tell you about Vedanth?", "Running at 60 frames per second and feeling great. How can I help?", "I'm great! I was just a bunch of cursors a moment ago, so this is a big upgrade. What would you like to know?"]), chips: ['Who is Vedanth?', 'Best projects'] }),
  thanks: () => ({ text: pick(['Anytime! 💚', 'Happy to help. Beep!', 'You got it! Anything else?']), chips: ['How do I contact him?', 'Best projects'] }),
  bye: () => ({ text: pick(['Bye! Thanks for stopping by. 👋', 'See you! Vedanth would love to hear from you, by the way.', 'Goodbye! I’ll be floating right here.']), actions: CONTACT_ACTIONS.slice(0, 2) }),
  bot: () => ({ text: "I'm **Vee**, a tiny robot assembled from the cursors that built this page. 🤖 I know Vedanth's resume and everything on this site, and I answer right here in your browser. I don't make things up: if I don't know, I'll point you to him.", chips: ['Who is Vedanth?', 'How was this site built?', 'What can you do?'] }),
  help: () => ({ text: 'Ask me anything about Vedanth, like:\n- his **projects** (and how they work)\n- **experience** and internships\n- **skills**: "does he know Docker?", "has he used AWS Lambda?"\n- **education**, **leadership**, **awards**\n- how to **contact** him\nYou can also tap the mic and just talk.', chips: ['Best projects', 'Experience', 'Skills', 'Contact'] }),
  about: () => ({ text: ABOUT(), chips: ['Best projects', 'Experience', 'Why should I hire him?'] }),
  recruiter: (ctx) => { ctx.recruiter = true; return { text: `Great to meet you${ctx.name ? `, ${ctx.name}` : ''}! ${PITCH}\n\nHe graduates in **2027** and is open to **internships, freelance work and collaborations**.`, chips: ['Experience', 'Skills', 'How do I contact him?'], actions: CONTACT_ACTIONS.slice(0, 2) }; },
  education: () => ({ text: `He's doing a **${ME.degree}** at **${ME.college}** (${ME.years}), with a CGPA of **${ME.cgpa}**.\n\nRelevant coursework: ${COURSEWORK.join(', ')}.`, chips: ['Certifications', 'Research paper', 'Experience'] }),
  cgpa: () => ({ text: `His CGPA is **${ME.cgpa}** in B.Tech CSE (Data Science) at NMIMS Hyderabad. Most of his learning shows up in what he builds, like a 7-service AWS app and a 98.5%-accurate face-auth pipeline.`, chips: ['Best projects', 'Education'] }),
  skills: () => ({ text: STACK_TEXT, chips: ['Does he know AWS Lambda?', 'Best projects', 'Experience'] }),
  projects: (ctx) => { ctx.last = { type: 'list', item: 'projects' }; return { text: `He has built **25 projects** (every one is in the project explorer on this page). The headliners:\n${MAIN.map((p) => `- **${p.name}**: ${p.one}`).join('\n')}`, chips: ['Tell me about Face Auth', 'Tell me about the Recipe Generator', 'More projects'], actions: [{ label: 'Show me on the page', scroll: '#work' }] }; },
  moreProjects: () => ({ text: `More builds:\n${SMALL.map((p) => `- **${p.name}**: ${p.one}`).join('\n')}`, chips: ['Best projects', 'What are his skills?'] }),
  best: (ctx) => { const p = MAIN[1]; ctx.last = { type: 'project', item: p }; ctx.facetsSeen = new Set(); return { text: `Hard to pick, but two stand out:\n- **Face Auth Attendance**: ${MAIN[1].impact} ${MAIN[1].challenge}\n- **AI Recipe Generator**: ${MAIN[0].one} ${MAIN[0].impact}\n\nFor real-world impact, **AquaFlow** is in production for Indian Railways.`, chips: ['How does Face Auth work?', 'How does the Recipe Generator work?', 'Tell me about AquaFlow'] }; },
  experience: (ctx) => { ctx.last = { type: 'list', item: 'experience' }; return { text: `His experience so far:\n${ROLES.map((r) => `- **${r.org}**: ${r.role} (${r.when})`).join('\n')}\n- **Freelance**: AquaFlow for Indian Railways`, chips: ['Tell me about Infosys', 'What does he do at AWS?', 'Projects'], actions: [{ label: 'Show the journey', scroll: '#journey' }] }; },
  current: (ctx) => roleAnswer(ROLES[0], ctx),
  awards: () => ({ text: `Highlights:\n${AWARDS.map((a) => `- ${a}`).join('\n')}`, chips: ['Leadership roles', 'Research paper'], actions: [{ label: 'Show highlights', scroll: '#built' }] }),
  leadership: () => ({ text: `He leads a lot outside class:\n${LEADERSHIP.map((a) => `- ${a}`).join('\n')}`, chips: ['Awards', 'What does he do at AWS?'] }),
  research: () => ({ text: `He published **"${PAPER.title}"** on ${PAPER.where} (${PAPER.when}). It's an experimental analysis of attention exercises and cognitive performance. He also did quantitative research as an intern at **Gudsky Research Foundation**.`, chips: ['Experience', 'Education'] }),
  certs: () => ({ text: `Certifications:\n${CERTS.map((c) => `- ${c}`).join('\n')}\n\nEvery certificate opens in the Credentials section, and most link to the issuer so you can verify them.`, chips: ['AWS experience', 'Skills'], actions: [{ label: 'Show certificates', scroll: '#creds' }] }),
  email: () => ({ text: `His email is ${mail}. He usually replies quickly.`, actions: [{ label: 'Write an email', href: `mailto:${ME.email}` }, { label: 'Copy email', copy: ME.email }] }),
  phone: () => ({ text: `You can call him at [${ME.phone}](${ME.phoneHref}) (Hyderabad, ${ME.tz}).`, actions: [{ label: 'Call', href: ME.phoneHref }, { label: 'Copy number', copy: ME.phone.replace(/\s/g, '') }] }),
  linkedin: () => ({ text: `Here's his LinkedIn: [linkedin.com/in/vedanth-raj](${ME.linkedin})`, actions: [{ label: 'Open LinkedIn', href: ME.linkedin }] }),
  github: () => ({ text: `His code is on GitHub: [github.com/vedanth-raj](${ME.github})`, actions: [{ label: 'Open GitHub', href: ME.github }] }),
  contact: () => ({ text: `The easiest ways to reach Vedanth:\n- **Email**: ${mail}\n- **Phone**: [${ME.phone}](${ME.phoneHref})\n- **LinkedIn**: [vedanth-raj](${ME.linkedin})\n- **GitHub**: [vedanth-raj](${ME.github})\n\nI can't send messages myself, but the "Let's talk" form drafts an email for you.`, actions: CONTACT_ACTIONS }),
  resume: () => ({ text: `I've got his resume memorised! Ask me about any part of it. For the PDF, email him at ${mail} and he'll send the latest version. LinkedIn has it too.`, chips: ['Experience', 'Skills', 'Education'], actions: [{ label: 'Request by email', href: `mailto:${ME.email}?subject=${encodeURIComponent('Resume request')}` }, { label: 'LinkedIn', href: ME.linkedin }] }),
  location: () => ({ text: `He's based in **${ME.city}** (${ME.tz}). For relocation or remote arrangements, that's best discussed with him directly at ${mail}.`, chips: ['Is he available?', 'Contact'] }),
  availability: () => ({ text: `Yes: he's **open to internships, freelance projects and collaborations** (he graduates in 2027). For start dates or a specific role, reach out directly: ${mail}.`, actions: CONTACT_ACTIONS }),
  why: () => ({ text: PITCH, chips: ['Best projects', 'Experience', 'How do I contact him?'] }),
  weakness: () => ({ text: "I'm a robot made of his cursors, so I'm a little biased. 😄 That's a great interview question for him to answer himself. What I can say: he's still a student (graduating 2027), so his experience is internships, freelance work and serious projects rather than years in industry.", chips: ['Why should I hire him?', 'Contact'] }),
  hobbies: () => ({ text: `Outside work: ${HOBBIES}`, chips: ['Awards', 'Leadership'] }),
  cloud: (ctx) => roleAnswer(ROLES[0], ctx),
  ai: () => ({ text: `AI/ML is his core. He's studying CSE (Data Science) and has built:\n- **Face Auth**: MTCNN → Dlib → ResNet-50, 98.5% accuracy at ~50 ms\n- **ANPR**: YOLOv10n + OpenCV + Tesseract\n- **MemoryTrack**: person re-ID with 720-D FAISS vectors\n- **AI Recipe Generator**: GenAI on Amazon Bedrock\n- **LitWise AI**: NLP + Gemini literature review, his Infosys internship project\n- **DermAegis** and **MIRAGE**: team research in medical AI and astro-ML`, chips: ['How does Face Auth work?', 'Tell me about LitWise AI'] }),
  web: () => ({ text: `Full-stack is a big part of his work:\n- **Smart Hospital**: Next.js, Node.js, MongoDB, JWT with 4 roles\n- **AquaFlow**: JS, Tailwind, Vite (in production for Indian Railways)\n- **Infosys** (full-stack intern) and **InnoByte** (web dev intern)\n- And this site, built by hand with Vite`, chips: ['Tell me about Smart Hospital', 'Experience'] }),
  mobile: () => ({ text: 'He builds cross-platform apps with **Flutter + Firebase**: the **Campus Voting System** (OTP login, live tallies) and **DayPlanner** (priority queues, reminders, offline storage).', chips: ['More projects', 'Skills'] }),
  data: () => ({ text: 'On the data side: **Power BI** (Syllabus Tracker), Pandas and NumPy, SQL (MySQL, PostgreSQL), and analysis work at **Gudsky Research** and **Espiratia** (KPI tracking, market research).', chips: ['Experience', 'Skills'] }),
  salary: () => ({ text: `That's one for Vedanth himself. I only know what's public. Drop him a line at ${mail}.`, actions: CONTACT_ACTIONS.slice(0, 2) }),
  time: () => {
    const t = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    return { text: `It's **${t}** in Hyderabad right now (${ME.tz}). The contact section shows how your working hours overlap with his.`, actions: [{ label: 'Compare time zones', scroll: '#contact' }] };
  },
  joke: () => ({ text: pick(['Why did the developer go broke? He used up all his cache. 💸', "I asked Vedanth's Lambda functions for a joke. They said it'd be cold-started.", 'There are 10 kinds of people: those who understand binary and those who hire Vedanth. 😄', "Fun fact: I'm made of five cursors (API, UI, DB, WS and Ops). Teamwork!"]), chips: ['Another one', 'Who is Vedanth?'] }),
  age: () => ({ text: `I don't share personal details like that. What I can say: he's a 2023–2027 B.Tech student at NMIMS Hyderabad.`, chips: ['Education', 'Experience'] }),
  spoken: () => ({ text: `He works in **English** and presents to big groups regularly (university-wide AWS sessions, fest sponsorships). For other languages, just ask him!`, chips: ['Leadership', 'Contact'] }),
  compliment: () => ({ text: pick(['Aww, my LEDs are blushing. 🥹', "Stop it, you'll overheat my CPU. 💚", "Thank you! Vedanth built me, so I'll pass it on."]), chips: ['Best projects', 'Contact'] }),
  insult: () => ({ text: "Ouch, my pixels! 🥲 I'm a small robot doing my best. Try asking about his projects or experience, I'm good at those.", chips: ['Best projects', 'Experience'] }),
  more: () => H.about(),
  yes: () => ({ text: 'Great! What would you like to know?', chips: ['Best projects', 'Experience', 'Skills'] }),
  no: () => ({ text: 'Okay! I’m here if you need me.', chips: ['Best projects', 'Contact'] }),
  city: () => ({ text: "**Vedanth's City** is this portfolio's game mode: a neon 3D city built in three.js. You fly in over the bay, meet Vedanth at his garage, take the wheel and drive through six districts (Education, Skills, Projects, Achievements, Experience, Certifications). Hold to drive, steer to collect AWS credits, and click any sign to open it. I ride along as your co-pilot!", actions: [{ label: "Enter Vedanth's City", href: '/city.html' }], chips: ['Best projects', 'How was this site built?'] }),
  site: (ctx) => projectAnswer(PROJECTS.find((p) => p.id === 'site'), null, ctx),
};

/* ---------------- fallback retrieval over every fact ---------------- */
const STOP = new Set('a an the is are was were be been of to in on for at by with and or but if what which who whom whose how why when where does do did has have had he his him i me my you your it its this that these those can could would should will about tell any some please there their them they so as from into than then just also very much more most'.split(' '));
const DOCS = [
  ...PROJECTS.map((p) => ({ text: `**${p.name}**: ${p.one} ${p.impact || ''}`, raw: [p.name, p.one, p.how, p.impact, p.challenge, (p.stack || []).join(' ')].join(' ') })),
  ...ROLES.map((r) => ({ text: `**${r.org}** (${r.role}, ${r.when}): ${r.what}`, raw: [r.org, r.role, r.what, r.more].join(' ') })),
  ...AWARDS.map((a) => ({ text: a, raw: a })),
  ...LEADERSHIP.map((a) => ({ text: a, raw: a })),
  ...CERTS.map((c) => ({ text: `Certification: ${c}`, raw: c })),
  { text: ABOUT(), raw: `${ME.pitch} ${ME.stats}` },
].map((d) => ({ ...d, toks: new Set(words(norm(d.raw)).filter((t) => !STOP.has(t))) }));
const DF = {};
DOCS.forEach((d) => d.toks.forEach((t) => { DF[t] = (DF[t] || 0) + 1; }));

function retrieve(n) {
  const q = words(n).filter((t) => !STOP.has(t) && t.length > 2);
  if (!q.length) return null;
  let best = null;
  DOCS.forEach((d) => {
    let s = 0;
    q.forEach((t) => {
      if (d.toks.has(t)) s += Math.log(1 + DOCS.length / DF[t]);
      else if (t.length > 5 && [...d.toks].some((x) => x.length > 5 && osa(x, t) <= 1)) s += 0.6;
    });
    if (!best || s > best.s) best = { d, s };
  });
  return best && best.s >= 2.4 ? best.d : null;
}

const FALLBACK = () => ({
  text: pick([
    `Hmm, that one isn't in my memory banks. 🤖 I only know what's on Vedanth's resume and this site, and I won't guess. He can answer it directly at ${mail}.`,
    `I'm not sure about that, and I'd rather not make something up. Try asking about his projects, skills or experience, or ask Vedanth at ${mail}.`,
  ]),
  chips: ['What can you do?', 'Best projects', 'How do I contact him?'],
});

/* ---------------- main entry ---------------- */
export function createBrain() {
  const ctx = { last: null, facetsSeen: new Set(), offer: null, name: null, recruiter: false, turns: 0 };

  function reply(input) {
    const raw = String(input || '').slice(0, 500);
    const n = norm(raw);
    ctx.turns += 1;
    if (!n.trim()) return { text: 'Say something and I’ll do my best! 🙂', chips: ['Who is Vedanth?'] };

    // remember a name ("I'm Priya", "this is Arjun from Google")
    const nm = n.match(/\b(?:i am|i'm|im|my name is|this is|call me)\s+([a-z]{2,20})\b/);
    const NOT = new Set(['a', 'an', 'the', 'looking', 'hiring', 'interested', 'from', 'here', 'just', 'good', 'fine', 'ok', 'okay', 'great', 'recruiter', 'not', 'so', 'very', 'curious', 'new', 'back', 'trying', 'wondering', 'currently', 'working', 'with', 'on', 'in']);
    let named = null;
    if (nm && !NOT.has(nm[1])) { ctx.name = nm[1][0].toUpperCase() + nm[1].slice(1); named = ctx.name; }

    const intents = scoreIntents(n);
    const top = intents[0] || { id: null, s: 0 };
    const wc = words(n).length;
    const projects = findAll(n, PROJECTS, (p) => [p.name.toLowerCase(), ...p.aliases]);
    const roles = findAll(n, ROLES, (r) => [r.org.toLowerCase(), ...r.aliases]);
    const skills = findAll(n, SKILLS, (k) => [k.n.toLowerCase(), ...k.a]);
    const facet = facetOf(n);
    const refersBack = /\b(it|that|this|its|that one|this one|the project|the app|there|that role|that internship|same)\b/.test(n);

    // yes / no to something I offered
    if ((top.id === 'yes' || top.id === 'no') && wc <= 4 && ctx.offer) {
      const o = ctx.offer; ctx.offer = null;
      if (top.id === 'no') return { text: 'No worries! Anything else you’d like to know?', chips: ['Best projects', 'Experience'] };
      return H[o] ? H[o](ctx) : H.contact();
    }
    if (named && wc <= 6 && !projects.length && !roles.length && (!top.id || ['greet', 'yes'].includes(top.id))) {
      return { text: `Nice to meet you, ${named}! 👋 I'm Vee. What would you like to know about Vedanth?`, chips: ['Who is Vedanth?', 'Best projects', 'Why should I hire him?'] };
    }

    // short social messages win when nothing specific is mentioned
    const social = ['greet', 'howareyou', 'thanks', 'bye', 'compliment', 'insult', 'bot', 'joke', 'recruiter'];
    if (social.includes(top.id) && top.s >= 3 && !projects.length && !roles.length && (wc <= 7 || top.id === 'recruiter' || top.id === 'bot')) {
      if (top.id === 'joke') ctx.last = { type: 'joke' };
      return H[top.id](ctx);
    }
    if (/^ (another( one)?|one more|again) $/.test(n) && ctx.last?.type === 'joke') return H.joke();

    // skill questions ("does he know docker?", "has he used lambda?")
    if (skills.length && (SKILL_Q.test(n) || (!top.id && !projects.length && !roles.length) || (top.id === 'projects' && !projects.length))) {
      ctx.last = { type: 'skill', item: skills[0] };
      return skillAnswer(skills);
    }
    const ask = SKILL_Q.test(n) && !projects.length && !roles.length && !skills.length
      ? n.match(/(?:know|use|used|with|in|familiar with|experience with|worked with|good at|proficient in)\s+([a-z0-9+#.\-]+(?:\s[a-z0-9+#.\-]+)?)\s*$/) : null;
    const thing = ask ? ask[1].trim() : '';
    if (thing && !STOP.has(thing) && !scoreIntents(` ${thing} `).length) {
      return { text: `I don't see **${thing}** on his resume or in his projects, so I won't claim it. Closest things he has used are in his stack below. Want me to list them?`, chips: ['Yes, show his stack', 'Contact'], offerNext: 'skills', ctxOffer: 'skills' };
    }

    // a specific project or role
    if (projects.length >= 2 && !facet) {
      const two = projects.slice(0, 3);
      ctx.last = { type: 'project', item: two[0] };
      return { text: two.map((p) => `- **${p.name}**: ${p.one}`).join('\n'), chips: two.map((p) => `Tell me about ${short(p)}`) };
    }
    if (projects.length) return projectAnswer(projects[0], facet, ctx);
    if (roles.length && !(roles[0].id === 'aws' && ['skills', 'certs'].includes(top.id) && top.s >= 2.4)) return roleAnswer(roles[0], ctx);

    // follow-ups: "tell me more", "what stack did it use?"
    if ((top.id === 'more' || (facet && refersBack) || (facet && wc <= 6 && !top.id)) && ctx.last) {
      const L = ctx.last;
      if (L.type === 'project') return projectAnswer(L.item, facet, ctx);
      if (L.type === 'role') return roleAnswer(L.item, ctx, true);
      if (L.type === 'list' && L.item === 'projects') return H.moreProjects();
      if (L.type === 'list' && L.item === 'experience') return roleAnswer(ROLES[1], ctx);
      if (L.type === 'skill') return H.skills();
    }
    if (/more projects|other projects|smaller projects|what else has he built/.test(n)) return H.moreProjects();
    if (/other experience|other internships|previous (jobs|internships)/.test(n)) return H.experience(ctx);
    if (/yes,? show his stack/.test(n)) return H.skills();

    if (top.id && H[top.id] && top.s >= 1.5) return H[top.id](ctx);

    const doc = retrieve(n);
    if (doc) return { text: `Here's what I know on that: ${doc.text}`, chips: ['Tell me more', 'Best projects', 'Contact'] };
    return FALLBACK();
  }

  return {
    reply(input) {
      const r = reply(input);
      if (r.ctxOffer) { ctx.offer = r.ctxOffer; delete r.ctxOffer; delete r.offerNext; }
      return r;
    },
    reset() { Object.assign(ctx, { last: null, facetsSeen: new Set(), offer: null, turns: 0 }); },
  };
}

export const WELCOME = {
  text: `Hi! 👋 I'm **Vee**, Vedanth's pocket robot. I was just assembled from the cursors that built this page.\n\nAsk me anything about his projects, experience, skills or how to reach him. Type, or tap the mic and talk.`,
  chips: ['Who is Vedanth?', 'Best projects', 'AWS experience', 'Why should I hire him?', 'How do I contact him?'],
};
