/* ==========================================================================
   CREDENTIALS · certificates, experience letters, badges and achievements
   Files live in /public/creds (rendered from the originals in Downloads:
   <id>.webp = preview, <id>-thumb.webp = card image, <id>.pdf = original).
   Shown in the Credentials section with a preview viewer (js/creds.js).
   ========================================================================== */

export const CRED_TABS = [
  ['certs', 'Certifications'],
  ['work', 'Internship letters'],
  ['wins', 'Achievements & badges'],
];

const INFOSYS_VERIFY = 'https://verify.onwingspan.com';

export const CREDS = [
  // ---------- certifications ----------
  { id: 'aws-cloud-architecting', tab: 'certs', title: 'AWS Academy Graduate: Cloud Architecting', issuer: 'Amazon Web Services', date: 'Oct 2026', meta: '60 hours', verify: 'https://www.credly.com/go/aBcGdvgy', pdf: true },
  { id: 'aws-cloud-foundations', tab: 'certs', title: 'AWS Academy Graduate: Cloud Foundations', issuer: 'Amazon Web Services', date: 'Apr 2026', meta: '20 hours', verify: 'https://www.credly.com/go/a5JMqsPD', pdf: true },
  { id: 'aws-ml-foundations', tab: 'certs', title: 'AWS Academy Graduate: Machine Learning Foundations', issuer: 'Amazon Web Services', date: 'Apr 2025', meta: '20 hours', verify: 'https://www.credly.com/go/wvLjYkSA', pdf: true },
  { id: 'gcp-computing-foundations', tab: 'certs', title: 'Google Cloud Computing Foundations', issuer: 'Google Cloud', meta: 'Certificate', contain: true },
  { id: 'gcp-secure-network-badge', tab: 'certs', title: 'Build a Secure Google Cloud Network', issuer: 'Google Cloud', meta: 'Skill badge · Intermediate', contain: true },
  { id: 'gcp-develop-network-badge', tab: 'certs', title: 'Develop Your Google Cloud Network', issuer: 'Google Cloud', meta: 'Skill badge · Intermediate', contain: true },
  { id: 'cisco-networking', tab: 'certs', title: 'Networking Basics', issuer: 'Cisco Networking Academy', date: 'Nov 2025', pdf: true },
  { id: 'cisco-os', tab: 'certs', title: 'Operating Systems Basics', issuer: 'Cisco Networking Academy', date: 'Nov 2025', pdf: true },
  { id: 'infosys-ai-primer', tab: 'certs', title: 'Artificial Intelligence Primer Certification', issuer: 'Infosys Springboard', date: 'Jul 2025', verify: INFOSYS_VERIFY, pdf: true },
  { id: 'infosys-intro-ai', tab: 'certs', title: 'Introduction to Artificial Intelligence', issuer: 'Infosys Springboard', date: 'Jun 2025', verify: INFOSYS_VERIFY, pdf: true },
  { id: 'infosys-nlp', tab: 'certs', title: 'Introduction to Natural Language Processing', issuer: 'Infosys Springboard', date: 'Jun 2025', verify: INFOSYS_VERIFY, pdf: true },
  { id: 'infosys-intro-ds', tab: 'certs', title: 'Introduction to Data Science', issuer: 'Infosys Springboard', date: 'Jun 2025', verify: INFOSYS_VERIFY, pdf: true },

  // ---------- internship letters ----------
  { id: 'infosys-internship', tab: 'work', title: 'Internship 6.0: AI System to Review and Summarize Research Papers', issuer: 'Infosys Springboard', date: 'Dec 2025 – Feb 2026', meta: 'Certificate of completion', verify: INFOSYS_VERIFY, pdf: true, project: 'litwise' },
  { id: 'innobyte-experience', tab: 'work', title: 'Experience Letter: Web Developer Intern', issuer: 'InnoByte Services', date: 'Nov 2025', meta: 'Experience letter', pdf: true, project: 'kingsukh' },
  { id: 'espiratia-internship', tab: 'work', title: 'Certificate of Internship: Data Insight & Market Research Intern', issuer: 'Espiratia (Uttavas Ridya Pvt. Ltd.)', date: 'Jun – Sep 2025', meta: '3-month internship', pdf: true },

  // ---------- achievements & badges ----------
  { id: 'drone-conquest', tab: 'wins', title: '1st place: Drone Conquest, KAUNYAK 2026', issuer: 'NMIMS Hyderabad · Vinyasa × IEEE', date: 'Feb 2026', meta: 'Winner', wide: true },
  { id: 'aws-sbg-leader-badge', tab: 'wins', title: 'AWS Student Builder Group: Leader', issuer: 'Amazon Web Services', date: '2026', meta: 'Campus Leader & Group Leader', contain: true },
  { id: 'aws-sbg-spark-badge', tab: 'wins', title: 'AWS Student Builder Group: Spark', issuer: 'Amazon Web Services', date: '2026', meta: 'Badge', contain: true },
  { id: 'codeit-welcome', tab: 'wins', title: 'Batch Representative, CodeIT Coding Club', issuer: 'STME, NMIMS Hyderabad', date: 'Aug 2024', meta: 'Appointment letter', pdf: true },
];

// Achievements without a document to preview (shown as text tiles in the same tab).
export const WINS_TEXT = [
  ['₹1.5L+', 'Sponsorships raised for KAUNYAK UG Fest 2026 (NM-Hacks, Robo Wars)'],
  ['Head', 'Robotics Club (Vinyasa) · Sports Committee (Impulse), NMIMS'],
  ['70+', 'Students onboarded as Hostel Committee Head'],
  ['2 papers', 'Neurocognitive attention training (ResearchGate, Aug 2025) · RTOS for fire-brigade emergency response (with C. Harini)'],
  ['DOI', 'MIRAGE: JWST exoplanet retrieval research, archived on Zenodo'],
];
