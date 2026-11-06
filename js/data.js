/* ==========================================================================
   CONTENT · edit your details here
   (Timings in FLOWS are illustrative, and the hospital rows are demo data.
   The page says so next to each widget.)
   ========================================================================== */

export const HERO_WORDS = ['DEVELOPER', 'CLOUD', 'AI/ML', 'VISION', 'LEADER'];

export const MARQUEE = ['Developer', 'Cloud', 'AI/ML', 'Computer vision', 'Full-stack', 'GenAI'];

export const PROJECTS = [
  {
    id: 'recipe',
    title: 'AI Recipe Generator',
    cat: 'Cloud · GenAI',
    color: '#a78bfa',
    url: 'recipe-gen · bedrock',
    desc: 'Serverless GenAI app that personalises recipes with Amazon Bedrock (Titan Text), across 7 AWS services.',
    tags: ['Bedrock', '5 × Lambda', 'DynamoDB', 'Cognito', 'CloudFormation'],
    mock: { type: 'chat', ask: 'paneer, spinach · 20 min · vegetarian', answer: 'Here is a 4-step recipe that fits your time and diet…' },
    system: [['edge', 'CloudFront + S3'], ['auth', 'Cognito · JWT'], ['api', 'API Gateway'], ['fn', '5 × Lambda'], ['ai', 'Bedrock · Titan Text'], ['db', 'DynamoDB']],
  },
  {
    id: 'face',
    repo: 'https://github.com/vedanth-raj/ats',
    title: 'Face Auth Attendance',
    cat: 'Computer vision',
    color: '#5fd4f4',
    url: 'face-auth · live stream',
    desc: 'Real-time face verification that marks attendance from live video: 98.5% accuracy at ~50 ms.',
    tags: ['Python', 'OpenCV', 'MTCNN', 'ResNet-50', 'Socket.io'],
    mock: { type: 'vision', label: 'verified · 50 ms' },
    system: [['in', 'Webcam stream'], ['io', 'Socket.io frames'], ['detect', 'MTCNN'], ['align', 'Dlib landmarks'], ['embed', 'ResNet-50'], ['match', 'Threshold 0.4']],
  },
  {
    id: 'hospital',
    repo: 'https://github.com/vedanth-raj/Hospital-management-system',
    title: 'Smart Hospital',
    cat: 'Full-stack',
    color: '#34d399',
    url: 'smart-hospital · admin',
    desc: 'Healthcare platform for appointments and clinical operations, with four role-based dashboards behind JWT.',
    tags: ['Next.js', 'React', 'Firebase', 'Express', 'RBAC'],
    mock: { type: 'dash', kpis: [['Admin', '·'], ['Doctor', '·'], ['Reception', '·']], bars: [40, 62, 48, 80, 58, 72, 90, 66] },
    system: [['ui', 'Next.js dashboards'], ['auth', 'Role-based access · 4 roles'], ['api', 'Express API'], ['db', 'Firebase'], ['mod', '8+ feature modules']],
  },
  {
    id: 'aquaflow',
    title: 'AquaFlow',
    cat: 'Freelance · Indian Railway',
    color: '#f5c518',
    url: 'aquaflow · members',
    desc: 'Swimming-pool membership and operations platform, built and deployed as a freelance project for Indian Railway.',
    tags: ['JavaScript', 'Tailwind', 'Vite', 'SMTP'],
    mock: { type: 'table', rows: [['Member M-0141', 'Renewal', 'Due soon', 'warn'], ['Member M-0142', 'Morning slot', 'Active', 'ok'], ['Member M-0143', 'Waitlist', 'Queued', 'warn'], ['Member M-0144', 'Payment', 'Paid', 'ok'], ['Member M-0145', 'Payment', 'Overdue', 'bad']] },
    system: [['ui', 'Admin dashboard'], ['core', 'Members · waitlist'], ['jobs', 'Renewal alerts'], ['mail', 'PHPMailer SMTP']],
  },
  {
    id: 'litwise',
    repo: 'https://github.com/vedanth-raj/R-A',
    title: 'LitWise AI',
    cat: 'NLP · Infosys internship',
    color: '#ff7ab6',
    url: 'litwise · review pipeline',
    desc: 'Finds research papers, segments and scores them, then drafts a reviewed literature summary with Gemini 2.5.',
    tags: ['Python', 'Flask', 'Gemini 2.5', 'PyMuPDF', 'Semantic Scholar'],
    mock: { type: 'term', lines: ['litwise search "attention training"', 'parse PDFs → IMRaD sections', 'summarise · synthesise (Gemini)', 'review loop 0.70 → 0.79'] },
    system: [['search', 'Semantic Scholar · arXiv · OpenAlex'], ['parse', 'PyMuPDF + IMRaD segmentation'], ['score', 'Readability · TF-IDF'], ['llm', 'Gemini 2.5 synthesis'], ['review', 'Self-correcting loop']],
  },
  {
    id: 'anpr',
    title: 'ANPR',
    cat: 'Computer vision',
    color: '#ff9f43',
    url: 'anpr · gate-cam',
    desc: 'Detects number plates in real time with YOLOv10n, reads them with OCR and logs every vehicle to MySQL.',
    tags: ['YOLOv10n', 'OpenCV', 'Tesseract', 'MySQL'],
    mock: { type: 'plate', plate: 'TS 09 AB 1234', label: 'plate · detected' },
    system: [['detect', 'YOLOv10n'], ['crop', 'OpenCV'], ['ocr', 'Tesseract'], ['db', 'MySQL vehicle log']],
  },
];

export const MORE = [
  ['MemoryTrack', 'Person re-identification that fuses appearance, pose, colour and motion into a 720-D FAISS vector.'],
  ['Campus Voting System', 'Flutter + Firebase ballots with OTP login and real-time tallies.'],
  ['Care_4_U Hospital', 'Appointment portal on AWS EC2 with DynamoDB, SNS, S3 and CloudFront.'],
  ['PlantVillage Classifier', 'Deep-learning crop-disease classifier on 128×128 leaf images.'],
  ['MedLedger / TrialLink', 'Blockchain concept for clinical-trial data provenance.'],
  ['Syllabus Tracker', 'Power BI dashboard for academic progress and KPIs.'],
  ['Voice Meeting Assistant', 'Transcribes meetings and pulls out agenda and action items.'],
  ['DayPlanner App', 'Flutter productivity app with priority queues and offline storage.'],
  ['Sentrix & NMIMS Portals', 'Campus grievance workflows with secure authentication.'],
];

export const FLOWS = [
  {
    id: 'recipe',
    label: 'Generate a recipe',
    project: 'Recipe Gen',
    trace: 'req_7f3a',
    breakLabel: 'Throttle Bedrock',
    breakAt: 5,
    breakLog: [[851, 'bedrock ThrottlingException · 429'], [852, 'retry 1 · backoff 200 ms']],
    recover: [1890, 'bedrock ok on retry · recipe drafted'],
    done: 'HTTP 200 · recipe returned to the app',
    hops: [
      { kind: 'Client', name: 'Browser', note: 'prompt + JWT', t: 0, d: 0.4, log: 'POST /recipe · "paneer, spinach, 20 min"', what: 'the web app sends the ingredients with the Cognito token.' },
      { kind: 'Edge', name: 'CloudFront', note: 'TLS · cache', t: 0.4, d: 1.2, log: 'cloudfront → api gateway · TLS1.3', what: 'serves the static app from S3 and forwards API calls.' },
      { kind: 'Auth', name: 'Cognito', note: 'verify JWT', t: 1.6, d: 2.2, log: 'cognito jwt ok · user u_29f', what: 'checks the signed token before anything runs.' },
      { kind: 'API', name: 'API Gateway', note: 'route + throttle', t: 3.8, d: 1.0, log: 'apigw POST /recipe → lambda', what: 'routes the call and applies rate limits.' },
      { kind: 'Function', name: 'Lambda', note: 'build prompt', t: 4.8, d: 6.0, log: 'lambda prompt built · diet + time', what: 'one of five Lambdas; shapes the prompt from the user profile.' },
      { kind: 'Model', name: 'Bedrock', note: 'Titan Text', t: 10.8, d: 840, log: 'bedrock titan-text · recipe drafted', what: 'Amazon Titan generates the recipe. This is most of the time.' },
      { kind: 'DB', name: 'DynamoDB', note: 'save recipe', t: 850.8, d: 6.5, log: 'dynamodb PutItem recipes · ok', what: 'stores the recipe against the user for history.' },
    ],
  },
  {
    id: 'face',
    label: 'Mark attendance',
    project: 'Face Auth',
    trace: 'frm_1042',
    breakLabel: 'Drop frames',
    breakAt: 1,
    breakLog: [[6, 'buffer full · frame dropped'], [7, 'waiting for the next frame']],
    recover: [40, 'frame #1043 received · continuing'],
    done: 'present · ~50 ms end to end',
    hops: [
      { kind: 'Camera', name: 'Webcam', note: 'grab frame', t: 0, d: 2, log: 'frame #1042 captured', what: 'the browser grabs a frame from the webcam.' },
      { kind: 'Stream', name: 'Socket.io', note: 'binary push', t: 2, d: 4, log: 'socket.io emit frame', what: 'frames stream to the Python server over a socket.' },
      { kind: 'Detect', name: 'MTCNN', note: 'find faces', t: 6, d: 14, log: 'mtcnn 1 face found', what: 'finds the face and its bounding box.' },
      { kind: 'Align', name: 'Dlib', note: 'landmarks', t: 20, d: 6, log: 'dlib landmarks · aligned', what: 'lines up eyes and mouth so every face is compared the same way.' },
      { kind: 'Embed', name: 'ResNet-50', note: 'features', t: 26, d: 16, log: 'resnet-50 embedding ready', what: 'turns the aligned face into a feature vector.' },
      { kind: 'Match', name: 'Threshold', note: 'distance < 0.4', t: 42, d: 4, log: 'match found · under threshold 0.4', what: 'compares against enrolled faces; tuned from 0.6 to 0.4.' },
      { kind: 'Log', name: 'Attendance', note: 'mark present', t: 46, d: 4, log: 'attendance marked', what: 'writes the attendance record instantly.' },
    ],
  },
  {
    id: 'anpr',
    label: 'Read a plate',
    project: 'ANPR',
    trace: 'veh_88c1',
    breakLabel: 'Blur the plate',
    breakAt: 3,
    breakLog: [[48, 'ocr confidence too low · rejected'], [49, 're-threshold + sharpen']],
    recover: [71, 'tesseract retry · plate read'],
    done: 'vehicle logged and searchable',
    hops: [
      { kind: 'Camera', name: 'Gate cam', note: 'video frame', t: 0, d: 3, log: 'frame captured · gate 1', what: 'a frame arrives from the gate camera.' },
      { kind: 'Detect', name: 'YOLOv10n', note: 'plate box', t: 3, d: 18, log: 'yolov10n plate detected', what: 'finds the number plate in the frame.' },
      { kind: 'Crop', name: 'OpenCV', note: 'crop + deskew', t: 21, d: 5, log: 'opencv crop · deskew', what: 'crops and straightens the plate for reading.' },
      { kind: 'OCR', name: 'Tesseract', note: 'read text', t: 26, d: 22, log: 'tesseract read "TS09AB1234"', what: 'reads the characters off the plate.' },
      { kind: 'Check', name: 'Validator', note: 'plate format', t: 48, d: 1, log: 'format ok · TS 09 AB 1234', what: 'checks the text matches an Indian plate format.' },
      { kind: 'DB', name: 'MySQL', note: 'insert log', t: 49, d: 4, log: 'mysql INSERT vehicle_log · ok', what: 'stores the plate with time and camera.' },
      { kind: 'Index', name: 'Search', note: 'query ready', t: 53, d: 1, log: 'searchable by plate + time', what: 'the record can now be searched.' },
    ],
  },
];

const ALL = ['dashboard', 'appointments', 'patients', 'records', 'billing', 'settings', 'reschedule', 'cancel', 'export', 'book'];
export const ROLES = [
  { id: 'admin', name: 'Admin', count: 'all perms', blurb: 'Everything, including billing and settings.', can: ALL,
    perms: [['appointments.read', true], ['appointments.write', true], ['records.read', true], ['billing', true], ['settings', true]] },
  { id: 'doctor', name: 'Doctor', count: 'own patients', blurb: 'Their patients and records. No billing.', can: ['dashboard', 'appointments', 'patients', 'records', 'reschedule'],
    perms: [['appointments.read', true], ['appointments.write', true], ['records.read', true], ['billing', false], ['settings', false]] },
  { id: 'reception', name: 'Receptionist', count: 'front desk', blurb: "Books and reschedules. Can't open records.", can: ['dashboard', 'appointments', 'patients', 'reschedule', 'cancel', 'book'],
    perms: [['appointments.read', true], ['appointments.write', true], ['records.read', false], ['billing', false], ['settings', false]] },
  { id: 'patient', name: 'Patient', count: 'self only', blurb: 'Sees only their own bookings.', self: 'Ananya Rao', can: ['appointments'],
    perms: [['own appointments', true], ['others', false], ['records.read', false], ['billing', false], ['settings', false]] },
];

export const SIDEBAR = [
  ['dashboard', 'Dashboard', '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'],
  ['appointments', 'Appointments', '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'],
  ['patients', 'Patients', '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'],
  ['records', 'Records', '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'],
  ['billing', 'Billing', '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'],
  ['settings', 'Settings', '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.8 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3.2 14H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9"/>'],
];

export const APPOINTMENTS = [
  { id: '#A-2041', patient: 'Ananya Rao', doctor: 'Dr. Kapoor', slot: '09:30', status: 'Confirmed', cls: 'ok' },
  { id: '#A-2042', patient: 'Rohit Varma', doctor: 'Dr. Reddy', slot: '10:15', status: 'Waiting', cls: 'warn' },
  { id: '#A-2043', patient: 'Sneha Iyer', doctor: 'Dr. Kapoor', slot: '11:00', status: 'Done', cls: 'ok' },
  { id: '#A-2044', patient: 'Karthik Nair', doctor: 'Dr. Menon', slot: '12:30', status: 'Cancelled', cls: 'bad' },
  { id: '#A-2045', patient: 'Meera Joshi', doctor: 'Dr. Reddy', slot: '14:00', status: 'Confirmed', cls: 'ok' },
];

export const FEATS = {
  drone: {
    cap: 'Won 1st place in the university-wide Drone Conquest at KAUNYAK 2026.',
    html: () => `<div class="radar"><svg viewBox="0 0 400 300">
        <g stroke="rgba(255,255,255,0.08)"><circle cx="200" cy="150" r="40"/><circle cx="200" cy="150" r="80"/><circle cx="200" cy="150" r="120"/><path d="M200 10v280M40 150h320"/></g>
        <path class="drone-path" d="M60 230 C 110 120, 170 260, 210 150 S 300 60, 340 90"/>
        <g fill="#d4ff2a" stroke="none"><circle r="6"><animateMotion dur="6s" repeatCount="indefinite" path="M60 230 C 110 120, 170 260, 210 150 S 300 60, 340 90"/></circle></g>
        <g fill="none" stroke="#d4ff2a"><rect x="330" y="80" width="20" height="20" rx="3"/></g></svg></div>
        <div class="badge-big">1ST<small>Drone Conquest · KAUNYAK 2026</small></div>`,
  },
  sponsor: {
    cap: 'Led sponsorship outreach for KAUNYAK UG Fest, including the 24-hr NM-Hacks and Robo Wars.',
    html: () => `<p class="tiny">KAUNYAK UG Fest · Feb 2026</p><div class="badge-big" style="position:static;text-align:left;margin-top:6px">₹1.5L+<small>raised in sponsorships</small></div>
        <div class="meter"><i></i></div>
        ${['Krafton / Nodwin · BGMI', 'Udupi Drone & Robotics', 'Corporate sponsors · NM-Hacks & Robo Wars'].map((s, i) => `<div class="sponsor" style="animation-delay:${0.3 + i * 0.18}s"><b>0${i + 1}</b>${s}</div>`).join('')}`,
  },
  aws: {
    cap: 'A 6-week, outcome-driven cloud program for students, with live architecture demos.',
    html: () => `<p class="tiny">AWS Student Builder · NMIMS Hyderabad</p>
        <div class="weeks">${[1, 2, 3, 4, 5, 6].map((w) => `<span style="--i:${w}"><em>W${w}</em></span>`).join('')}</div>
        <p class="tiny" style="margin-bottom:8px">Shown live in sessions</p>
        <div class="svc"><span>Amazon Bedrock</span><span>Cognito</span><span>Lambda</span><span>DynamoDB</span><span>AWS Builder Center</span></div>
        <p class="tiny" style="margin-top:14px">Session: "Secure with AWS: User Verification with Amazon Cognito"</p>`,
  },
  paper: {
    cap: 'Published research on neurocognitive training and attention in data science students.',
    html: () => `<div class="paper"><small>ResearchGate · August 2025</small>
        <h5>The Effect of Neurocognitive Training-Based Attention Exercises on Cognitive Performance in Data Science Students</h5>
        <div class="ln" style="width:100%"></div><div class="ln" style="width:92%"></div><div class="ln" style="width:96%"></div><div class="ln" style="width:70%"></div>
        <small>Vedanth Raj · experimental analysis</small></div>`,
  },
  hostel: {
    cap: 'Coordinated welfare, accommodation and onboarding for 70+ students as Hostel Committee Head.',
    html: () => `<p class="tiny">Hostel Committee · campus onboarding</p><div class="badge-big" style="position:static;text-align:left;margin-top:6px">70+<small>students onboarded</small></div>
        <div class="dots-grid">${Array.from({ length: 70 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>`,
  },
};
