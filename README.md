# Career Sprint — 3D VR Interview Room

A realistic, immersive browser-based 3D Virtual Reality Interview Room built with **React**, **Three.js**, **WebXR**, and **TypeScript**. Developed as the spatial immersion foundation for **Career Sprint**, a platform designed for realistic corporate interview preparation.

---

## 🌟 Features

- **Photorealistic Executive Room Environment:**
  - **Interviewer's Executive Desk:** Dark walnut finish with beveled edges, modesty panel, and cable management.
  - **Realistic Human Interviewer Avatar (Dr. Evan Vance):** High-fidelity human face anatomy (sculpted nose, lips, eyelids, realistic hazel-blue eyes with sclera and pupils, teeth visible during speech, textured hair, tailored navy blazer, shirt collar, silk tie, and natural hands resting on the desk).
  - **Behavior State Machine:** Dynamically switches between **IDLE**, **LISTENING**, **THINKING**, **SPEAKING**, and **NODDING**.
  - **Mouth Talking Animation:** Smooth phoneme/viseme simulation with articulated lower jaw and lips opening/closing naturally with teeth revealed.
  - **Custom 3D Model Loading (`.glb`):** Seamless automatic loading of `src/assets/models/interviewer.glb` if present, with graceful procedural fallback.
  - **Developer Configuration Panel:** In-app HUD control for live testing behavior states, talking speed, chair height, rotation, and position.
  - **Candidate's Chair:** Contemporary ergonomic mesh conference chair positioned directly in front of the desk.
  - **High-Definition Open Laptop:** Aluminum unibody laptop displaying the *Career Sprint Candidate Evaluation Dashboard*.
  - **Desk Accessories:** Ceramic Career Sprint coffee mug, spiral notepad with pen, brass nameplate, and conference speakerphone puck.
  - **Panoramic Window:** Floor-to-ceiling glass window with natural directional sunlight overlooking high-rise downtown skyscrapers.
  - **Whiteboard:** Magnetic corporate whiteboard featuring a distributed systems architecture diagram and technical interview agenda.
  - **Door:** Frosted glass conference room door with stainless steel handle and "ROOM 402 — CAREER SPRINT SUITE" signage.
  - **Indoor Plants:** Tall corner potted fiddle-leaf fig in a fluted ceramic planter and desk succulent.
  - **Lighting & Soft Shadows:** Three-point studio lighting with directional sun rays streaming through the window, warm ceiling spotlights, and soft shadow mapping.

- **Dual Mode Support:**
  - **3D Browser Mode:** Smooth first-person navigation on any laptop or desktop using WASD keyboard movement and mouse drag.
  - **Immersive WebXR VR Mode:** Native stereoscopic 6DoF Virtual Reality when using WebXR headsets (e.g., Meta Quest 2/3/Pro, HTC Vive, Apple Vision Pro).

- **Responsive Multi-Platform Controls:**
  - **Desktop:** Keyboard WASD + Mouse look (with optional pointer lock).
  - **Mobile / Tablet:** Virtual touch D-pad, swipe look-pad, and quick seat reset.
  - **Camera Quick-Presets:** Instant viewpoints for Candidate Seat, Standing Center, Desk Inspection, Interviewer Perspective, Whiteboard, and City View.
  - **Day / Evening Lighting Ambiance:** Real-time lighting toggle between bright morning daylight and golden hour sunset ambiance.
  - **Optional Synthetic Office Hum:** Web Audio API procedural HVAC room tone without external audio files.

---

## 📂 Project Structure

```text
├── index.html                           # Main HTML entry with Google Fonts & metadata
├── metadata.json                        # Applet identity & permissions
├── package.json                         # Dependencies & run scripts
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite bundler configuration
├── src/
│   ├── main.tsx                         # React 19 root bootstrap
│   ├── App.tsx                          # App container
│   ├── index.css                        # Tailwind CSS styling
│   ├── assets/
│   │   ├── images/                      # High-res skyline & wall art textures
│   │   └── models/                      # Folder for interviewer.glb avatar model
│   └── components/
│       ├── UI/
│       │   ├── HUDOverlay.tsx           # Top brand header, [ENTER VR], view presets & help
│       │   ├── AvatarDevSettings.tsx    # Live avatar state, pose, and talking controls
│       │   ├── MobileControls.tsx       # On-screen touch D-pad & look gestures for phones/tablets
│       │   └── HelpModal.tsx            # Comprehensive in-app guide for college demonstrations
│       └── VRRoom/
│           ├── InterviewRoomScene.tsx   # Three.js WebGL canvas, WebXR session manager, animation loop
│           ├── InterviewerAvatar.ts     # Realistic human avatar, anatomical modeling & behavior state machine
│           ├── RoomObjects.ts           # Procedural 3D geometry (Walls, Desk, Chairs, Props)
│           ├── Textures.ts              # Procedural high-res canvas textures (Wood, Rug, Screen, Notes)
│           ├── VRControls.ts            # First-person camera rig, WASD math, collision boundaries
│           └── AudioAmbiance.ts         # Pure Web Audio API office room hum generator
└── README.md                            # Complete setup & demonstration documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)

### 2. Installation
To install the required dependencies:
```bash
npm install
```

### 3. Run the Development Server
To launch the 3D application:
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🎮 How to Use & Explore

### Desktop Controls:
- **Look Around:** Click and drag the mouse anywhere on the screen.
- **Move Forward:** `W` or `Up Arrow`
- **Move Backward:** `S` or `Down Arrow`
- **Strafe Left:** `A` or `Left Arrow`
- **Strafe Right:** `D` or `Right Arrow`
- **Reset to Chair:** Click the **"Candidate Chair"** button in the bottom bar.
- **Switch Views:** Use the camera presets bar at the bottom to jump between views (*Standing*, *Desk Inspection*, *Interviewer View*, *Whiteboard*, *City View*).
- **Lighting Toggle:** Click the **Sun / Moon** icon in the top right to switch between Day and Evening lighting.
- **Audio Ambiance:** Click the **Speaker** icon to toggle the subtle synthetic office room tone.

### Mobile & Tablet Controls:
- **Walk:** Tap the translucent on-screen D-pad on the bottom-left.
- **Look:** Drag within the touch-look pad on the bottom-right or swipe directly on the 3D canvas.
- **Reset:** Tap the **"Reset Seat"** button.

---

## 🥽 Testing Virtual Reality (WebXR)

### A. Testing on a VR Headset (Meta Quest 2 / 3 / Pro, Apple Vision Pro, Pico 4):
1. Put on your VR headset.
2. Open the built-in browser (e.g., **Meta Quest Browser** or Safari on VisionOS).
3. Open this application's URL.
4. You will see the blue **[ ENTER VR ]** button highlighted in the top bar.
5. Click **[ ENTER VR ]** using your VR controller or hand pinch.
6. The room will immerse you in full 3D stereoscopic scale.
7. Use the controller analog thumbsticks to walk around the room or inspect the interviewer desk up close!

### B. Testing Without a VR Headset (Simulating WebXR on PC):
If you do not have a VR headset, you can test WebXR right inside Google Chrome on your computer:
1. Install the official free **WebXR API Emulator** extension from the Chrome Web Store:
   [WebXR API Emulator on Chrome Web Store](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddkikhafmpflfcfdkogflggibhknan)
2. Open Chrome Developer Tools (`F12` or `Ctrl+Shift+I`).
3. Click the **WebXR** tab in DevTools.
4. Select a virtual device (e.g., *Oculus Quest 2* or *Meta Quest 3*).
5. The **[ ENTER VR ]** button in Career Sprint will immediately become enabled!

---

## ❓ Frequently Asked Questions

### 1. Do I need an API key to run this?
**No.** This 3D VR environment runs 100% locally in your browser using Three.js and WebGL. It does not require any API keys, tokens, or cloud services.

### 2. Do I need Python, Blender, or Unity?
**No.** All 3D objects, textures, and lighting are built directly in JavaScript/TypeScript using Three.js primitives and canvas generators. No Python virtual environment, no external 3D software, and no Unity installation are needed.

### 3. Which browsers support WebXR?
- **Oculus / Meta Quest Browser:** Full native WebXR support.
- **Google Chrome & Microsoft Edge (Desktop & Android):** Full WebXR support.
- **Apple Safari (VisionOS):** Native WebXR support.
- **Firefox:** WebXR supported (requires OpenXR runtime on Windows).

### 4. What if WebXR is not supported on my laptop?
The application will automatically detect this and display **"3D Browser Mode"**. You can smoothly navigate the entire 3D interview room using standard mouse and keyboard controls without needing a VR headset.
