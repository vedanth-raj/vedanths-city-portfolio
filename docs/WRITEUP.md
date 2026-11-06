# Vedanth's City: a portfolio you can drive through

**Live portfolio:** https://portfolio.d26tlmboyckuka.amplifyapp.com
**Creative feature (game mode):** https://portfolio.d26tlmboyckuka.amplifyapp.com/city.html
**GitHub:** https://github.com/vedanth-raj/vedanths-city-portfolio

## About me

I'm Vedanth Raj, a B.Tech CSE (Data Science) student at SVKM's NMIMS, STME Hyderabad (class of 2027) and an AWS Student Builder Campus Leader & Group Leader. I build serverless GenAI apps on AWS, real-time computer vision and full-stack platforms, and I head the Robotics Club (we won 1st place at Drone Conquest 2026).

## The portfolio

The main site has everything a recruiter needs: **About, Skills, Projects, Experience, Credentials and Contact**.

- **Build mode:** the page assembles itself live, driven by a team of animated cursors. When they go idle, they come together into **Vee**, a small robot co-pilot.
- **Vee** is a chatbot that knows my resume, projects and certificates. It runs entirely in the browser (intent matching, fuzzy search and retrieval over one knowledge file), so it's instant, costs nothing to run and never invents facts.
- **25 projects** in a filterable explorer with a detail drawer, and **credentials** you can preview and verify.

## The creative feature: Vedanth's City

A glowing **"Enter another world"** button on the side of every page (and a chip in the hero) opens **Vedanth's City**, a 96-second cinematic drive in the style of an open-world game trailer. Each district is a chapter of my journey:

1. **Arrival:** an aerial reveal of the city and an arch that reads **"Welcome to Vedanth's City"**, then a character reveal of me beside the car and "taking the wheel".
2. **Education:** the campus sign reads **NMIMS Hyderabad**, and a pylon shows **B.Tech CSE · Data Science · Class of 2027**.
3. **Skills:** neon signs for **Python, AWS, React** and a **Skills** screen.
4. **Projects:** billboards for the **AI Recipe Generator** (Amazon Bedrock, 7 AWS services), **Face Auth** (98.5% accuracy), **Smart Hospital**, **AquaFlow** and **LitWise AI**.
5. **Achievements:** a trophy plaza with **1st place, Drone Conquest 2026**, **₹1.5L+ sponsorships raised** and **AWS Campus Leader**.
6. **Experience:** towers for **AWS, Infosys, InnoByte, Gudsky Research and Espiratia**.
7. **Certifications:** gantries for **AWS Cloud Architecting, Google Cloud and Cisco Networking**.
8. **Contact:** the car pulls into the garage, I lean on it and smile, and the contact card appears.

**How you play it:** auto-drive is on by default and stops at every district. Press **A** to take the wheel: **hold** to drive, let go to brake. At the end of each district a card slides in with the full details (projects open, certificates open the originals). Titles and captions are keyed to the film's timeline, so they move with the camera and freeze when the car stops. There's a minimap, a speedometer and a district rail to jump around.

## How I built it

**Footage.** Every shot was generated in Google Flow. I made the stills with Nano Banana, using my own photos as the character reference and putting my real details on the signs, then animated them with Veo 3.1 and upscaled them to 1080p.

**Player.** The page is plain JavaScript (Vite, no framework). It downloads the whole film before the drive starts, showing a percentage, and plays it from memory through two double-buffered video elements, so nothing streams or stutters mid-drive.

**Encoding.** Each clip is encoded three ways with FFmpeg: 1080p AV1 (for devices that decode AV1 in hardware), 1080p H.264 as a fallback, and 720p H.264 for phones. The browser picks one with the MediaCapabilities API.

## AWS implementation

| Service | How I use it |
|---|---|
| **AWS Amplify Hosting** | Production hosting with HTTPS and a global CDN. I build the site with Vite and publish each version as a manual deployment (zip → `create-deployment` → upload → `start-deployment`) to the `portfolio` branch, all from the AWS CLI |
| **Amazon S3** | A static-website mirror of the same build in `vedanth-raj-portfolio` (us-east-1), synced with `aws s3 sync`, with a public-read bucket policy |

Screenshots of the Amplify app and its deployments, and of the S3 bucket, are attached to this project.

## Key learnings

- **Video on the web is a delivery problem as much as a creative one.** My first version looked soft and stuttered. The fixes were 1080p sources, lighter compression, choosing AV1 only where the device decodes it in hardware, and preloading everything into memory.
- **Slow motion is not braking.** Ramping a 24 fps video toward 0× shows the same frame for half a second and looks frozen. Easing between 1× and 0.5×, then pausing on a frame, feels like a real stop.
- **Generative video needs anchors.** Faces drifted when the model had to invent them mid-shot. Giving the clip a verified start *and* end frame kept my face consistent.
- **Put content in the scene, not just on top of it.** Rendering my details onto the billboards made the city feel like mine. Overlays then add what the signs can't hold.
- **Amplify makes shipping boring, in a good way:** every deploy was one CLI sequence with HTTPS and CDN out of the box.

## Challenges

- **Likeness:** the first clips looked like a generic person. I re-made the character stills from several of my photos, checked every face against my own, and re-generated the shots with anchored frames.
- **Text in AI video:** signs close to the camera stay crisp, but signs that appear far away mid-drive can smear. The cards and captions carry the exact details either way.
- **Load size vs. quality:** the full film is about 82 MB in AV1. I chose a full preload with a progress percentage, so the drive itself never pauses to buffer.
- **A false positive:** one generation was blocked as a "prominent person" (it was me). A different still of me went through.

## Screenshots

Portfolio: hero, projects, skills, credentials. City: loader, title, welcome arch, character reveal, each of the six districts, a district card and the contact scene. AWS: the Amplify app and deployments, and the S3 bucket.
