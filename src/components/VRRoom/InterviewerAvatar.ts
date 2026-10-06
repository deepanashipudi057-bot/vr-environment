import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type AvatarState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'NODDING';

export interface AvatarConfig {
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationY: number;
  scale: number;
  sittingHeightOffset: number;
  speakingSpeed: number;
  idleIntensity: number;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  positionX: 0.0,
  positionY: 0.0,
  positionZ: -1.35,
  rotationY: 0.0, // 0 rad faces towards +Z (the candidate)
  scale: 1.0,
  sittingHeightOffset: 0.0,
  speakingSpeed: 1.0,
  idleIntensity: 1.0,
};

export interface ProceduralAvatarRefs {
  rootGroup: THREE.Group;
  chestGroup: THREE.Group;
  neckGroup: THREE.Group;
  headGroup: THREE.Group;
  jawGroup: THREE.Group;
  mouthGroup: THREE.Group;
  upperLip: THREE.Mesh;
  lowerLip: THREE.Mesh;
  teethUpper: THREE.Mesh;
  teethLower: THREE.Mesh;
  leftEyelidUpper: THREE.Mesh;
  leftEyelidLower: THREE.Mesh;
  rightEyelidUpper: THREE.Mesh;
  rightEyelidLower: THREE.Mesh;
  leftEye: THREE.Group;
  rightEye: THREE.Group;
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  leftHandGroup: THREE.Group;
  rightHandGroup: THREE.Group;
}

/**
 * Creates realistic human eye (sclera + deep colored iris + pupil + corneal reflex)
 */
function createRealisticEye(eyeRadius: number = 0.024): THREE.Group {
  const eyeGroup = new THREE.Group();

  // White sclera with slight warm vascular tone
  const scleraGeo = new THREE.SphereGeometry(eyeRadius, 24, 24);
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xfaf5ef,
    roughness: 0.15,
    metalness: 0.0,
  });
  const sclera = new THREE.Mesh(scleraGeo, scleraMat);
  eyeGroup.add(sclera);

  // Colored Iris
  const irisCanvas = document.createElement('canvas');
  irisCanvas.width = 256;
  irisCanvas.height = 256;
  const ctx = irisCanvas.getContext('2d')!;

  // Deep hazel/blue iris texture
  const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  grad.addColorStop(0, '#0f172a'); // Black pupil
  grad.addColorStop(0.32, '#0f172a');
  grad.addColorStop(0.35, '#1e3a8a'); // Deep navy
  grad.addColorStop(0.65, '#2563eb'); // Professional corporate blue
  grad.addColorStop(0.85, '#38bdf8'); // Subtle iris highlight ring
  grad.addColorStop(1.0, '#1e293b'); // Dark limbal ring
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Radial striations for realistic iris depth
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 48; i++) {
    const angle = (i * Math.PI * 2) / 48;
    ctx.beginPath();
    ctx.moveTo(128 + Math.cos(angle) * 45, 128 + Math.sin(angle) * 45);
    ctx.lineTo(128 + Math.cos(angle) * 120, 128 + Math.sin(angle) * 120);
    ctx.stroke();
  }

  const irisTexture = new THREE.CanvasTexture(irisCanvas);
  const irisGeo = new THREE.CircleGeometry(eyeRadius * 0.58, 24);
  const irisMat = new THREE.MeshBasicMaterial({ map: irisTexture });
  const irisMesh = new THREE.Mesh(irisGeo, irisMat);
  irisMesh.position.set(0, 0, eyeRadius * 0.94);
  eyeGroup.add(irisMesh);

  // Glossy Cornea lens
  const corneaGeo = new THREE.SphereGeometry(eyeRadius * 1.02, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const corneaMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.96,
    roughness: 0.02,
    ior: 1.37,
    transparent: true,
    opacity: 0.35,
  });
  const cornea = new THREE.Mesh(corneaGeo, corneaMat);
  cornea.rotation.x = Math.PI / 2;
  cornea.position.set(0, 0, eyeRadius * 0.2);
  eyeGroup.add(cornea);

  return eyeGroup;
}

/**
 * Builds the high-fidelity procedural human avatar.
 * Eliminates all boxy/robotic/block aesthetics with smooth anatomical contours,
 * detailed facial features, realistic eyes, articulated mouth with teeth, and formal business suit.
 */
export function buildProceduralHumanAvatar(): { group: THREE.Group; refs: ProceduralAvatarRefs } {
  const root = new THREE.Group();
  root.name = 'ProceduralHumanInterviewer';

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd9a07a, // Natural healthy human skin tone
    roughness: 0.52,
    metalness: 0.02,
  });

  const lipMat = new THREE.MeshStandardMaterial({
    color: 0xb5735f, // Realistic natural lip tone
    roughness: 0.45,
    metalness: 0.05,
  });

  const teethMat = new THREE.MeshStandardMaterial({
    color: 0xfcfbf7, // Natural dental enamel
    roughness: 0.2,
    metalness: 0.0,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x221915, // Dark brown/espresso executive hair
    roughness: 0.85,
    metalness: 0.1,
  });

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x161e31, // Tailored dark navy executive blazer
    roughness: 0.85,
    metalness: 0.05,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Pure white dress shirt
    roughness: 0.6,
    metalness: 0.0,
  });

  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Sprint Blue silk tie
    roughness: 0.35,
    metalness: 0.15,
  });

  const eyelidMat = new THREE.MeshStandardMaterial({
    color: 0xd49b75,
    roughness: 0.55,
    metalness: 0.02,
  });

  // 1. Lower Body (Legs and Pelvis seated in chair)
  const pelvisGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.2, 16);
  const pelvis = new THREE.Mesh(pelvisGeo, suitMat);
  pelvis.position.set(0, 0.5, 0);
  root.add(pelvis);

  // Thighs seated under desk
  [-0.12, 0.12].forEach((tx) => {
    const thighGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.48, 16);
    const thigh = new THREE.Mesh(thighGeo, suitMat);
    thigh.rotation.x = Math.PI / 2;
    thigh.position.set(tx, 0.52, 0.25);
    root.add(thigh);
  });

  // 2. Chest & Torso (Breathing and Posture Group)
  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 0.62, -0.02);
  root.add(chestGroup);

  // Sculpted Torso / Tailored suit jacket
  const torsoGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.44, 20);
  torsoGeo.scale(1.15, 1.0, 0.75); // Natural human chest proportion (wider than deep)
  const torso = new THREE.Mesh(torsoGeo, suitMat);
  torso.position.y = 0.22;
  torso.castShadow = true;
  chestGroup.add(torso);

  // Shoulder Pads & Yoke
  const shoulderYokeGeo = new THREE.CylinderGeometry(0.28, 0.26, 0.14, 20);
  shoulderYokeGeo.scale(1.2, 1.0, 0.7);
  const shoulderYoke = new THREE.Mesh(shoulderYokeGeo, suitMat);
  shoulderYoke.position.y = 0.38;
  chestGroup.add(shoulderYoke);

  // Shirt Collar & Placket
  const shirtChest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.28, 0.04), shirtMat);
  shirtChest.position.set(0, 0.32, 0.14);
  chestGroup.add(shirtChest);

  // Suit Lapels (Left and Right)
  const lapelGeo = new THREE.BoxGeometry(0.06, 0.26, 0.02);
  const leftLapel = new THREE.Mesh(lapelGeo, suitMat);
  leftLapel.position.set(-0.08, 0.3, 0.15);
  leftLapel.rotation.z = -0.15;
  chestGroup.add(leftLapel);

  const rightLapel = new THREE.Mesh(lapelGeo, suitMat);
  rightLapel.position.set(0.08, 0.3, 0.15);
  rightLapel.rotation.z = 0.15;
  chestGroup.add(rightLapel);

  // Silk Tie & Windsor Knot
  const tieKnot = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, 8), tieMat);
  tieKnot.rotation.x = Math.PI;
  tieKnot.position.set(0, 0.41, 0.165);
  chestGroup.add(tieKnot);

  const tieBlade = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.3, 0.015), tieMat);
  tieBlade.position.set(0, 0.24, 0.16);
  chestGroup.add(tieBlade);

  // Pocket square on left chest
  const pocketSq = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.012, 0.01), shirtMat);
  pocketSq.position.set(-0.14, 0.34, 0.14);
  chestGroup.add(pocketSq);

  // 3. Neck & Adam's Apple
  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.44, 0.0);
  chestGroup.add(neckGroup);

  const neckGeo = new THREE.CylinderGeometry(0.065, 0.08, 0.14, 20);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 0.06;
  neckGroup.add(neck);

  // Subtle Adam's apple
  const adamsApple = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), skinMat);
  adamsApple.position.set(0, 0.06, 0.068);
  neckGroup.add(adamsApple);

  // Shirt collar ring
  const collarRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.015, 8, 24),
    shirtMat
  );
  collarRing.rotation.x = Math.PI / 2;
  collarRing.position.y = 0.02;
  neckGroup.add(collarRing);

  // 4. Head Group (Full Facial Anatomy)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.12, 0.0);
  neckGroup.add(headGroup);

  // Cranium (Top of head) - smooth sphere
  const craniumGeo = new THREE.SphereGeometry(0.125, 32, 24);
  craniumGeo.scale(0.95, 1.15, 1.05);
  const cranium = new THREE.Mesh(craniumGeo, skinMat);
  cranium.position.set(0, 0.1, 0.0);
  cranium.castShadow = true;
  headGroup.add(cranium);

  // Midface & Cheekbones - smooth tapered mesh
  const faceMidGeo = new THREE.SphereGeometry(0.11, 24, 24);
  faceMidGeo.scale(1.0, 1.1, 1.0);
  const faceMid = new THREE.Mesh(faceMidGeo, skinMat);
  faceMid.position.set(0, 0.06, 0.035);
  headGroup.add(faceMid);

  // Cheeks prominence
  [-0.065, 0.065].forEach((cx) => {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), skinMat);
    cheek.position.set(cx, 0.06, 0.075);
    headGroup.add(cheek);
  });

  // Nose: Bridge, Tip, Nostrils
  const noseGroup = new THREE.Group();
  noseGroup.position.set(0, 0.065, 0.11);

  // Bridge
  const noseBridgeGeo = new THREE.CylinderGeometry(0.012, 0.016, 0.055, 12);
  const noseBridge = new THREE.Mesh(noseBridgeGeo, skinMat);
  noseBridge.rotation.x = 0.28;
  noseBridge.position.set(0, 0.01, 0.008);
  noseGroup.add(noseBridge);

  // Tip
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.015, 16, 16), skinMat);
  noseTip.position.set(0, -0.016, 0.022);
  noseGroup.add(noseTip);

  // Nostrils
  [-0.014, 0.014].forEach((nx) => {
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.011, 12, 12), skinMat);
    nostril.position.set(nx, -0.02, 0.015);
    noseGroup.add(nostril);
  });

  headGroup.add(noseGroup);

  // Ears (Anatomical Helix & Lobe)
  [-0.115, 0.115].forEach((ex) => {
    const earGroup = new THREE.Group();
    earGroup.position.set(ex, 0.08, -0.01);
    earGroup.rotation.y = ex < 0 ? -0.2 : 0.2;

    const earGeo = new THREE.TorusGeometry(0.028, 0.01, 8, 16, Math.PI * 1.3);
    const ear = new THREE.Mesh(earGeo, skinMat);
    ear.rotation.z = ex < 0 ? 0.3 : -0.3;
    earGroup.add(ear);

    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), skinMat);
    lobe.position.set(0, -0.025, 0);
    earGroup.add(lobe);

    headGroup.add(earGroup);
  });

  // Eyebrows (Sculpted & Expressive)
  const browMat = new THREE.MeshStandardMaterial({ color: 0x1a120e, roughness: 0.9 });
  const browGeo = new THREE.CylinderGeometry(0.006, 0.004, 0.052, 8);

  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.rotation.z = Math.PI / 2 - 0.15;
  leftBrow.position.set(-0.046, 0.11, 0.118);
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.rotation.z = -Math.PI / 2 + 0.15;
  rightBrow.position.set(0.046, 0.11, 0.118);
  headGroup.add(rightBrow);

  // Eyes & Eyelids (Left and Right)
  const leftEye = createRealisticEye(0.02);
  leftEye.position.set(-0.045, 0.082, 0.095);
  headGroup.add(leftEye);

  const rightEye = createRealisticEye(0.02);
  rightEye.position.set(0.045, 0.082, 0.095);
  headGroup.add(rightEye);

  // Eyelids for natural blinking
  const upperEyelidGeo = new THREE.SphereGeometry(0.021, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const lowerEyelidGeo = new THREE.SphereGeometry(0.021, 16, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);

  const leftEyelidUpper = new THREE.Mesh(upperEyelidGeo, eyelidMat);
  leftEyelidUpper.rotation.x = 0.35;
  leftEye.add(leftEyelidUpper);

  const leftEyelidLower = new THREE.Mesh(lowerEyelidGeo, eyelidMat);
  leftEyelidLower.rotation.x = -0.3;
  leftEye.add(leftEyelidLower);

  const rightEyelidUpper = new THREE.Mesh(upperEyelidGeo, eyelidMat);
  rightEyelidUpper.rotation.x = 0.35;
  rightEye.add(rightEyelidUpper);

  const rightEyelidLower = new THREE.Mesh(lowerEyelidGeo, eyelidMat);
  rightEyelidLower.rotation.x = -0.3;
  rightEye.add(rightEyelidLower);

  // Modern Professional Spectacles / Glasses (Classic wireframe)
  const glassesGroup = new THREE.Group();
  glassesGroup.position.set(0, 0.082, 0.115);

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.2,
  });

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.035, 8), frameMat);
  bridge.rotation.z = Math.PI / 2;
  glassesGroup.add(bridge);

  [-0.045, 0.045].forEach((gx) => {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.0025, 8, 24), frameMat);
    rim.position.x = gx;
    glassesGroup.add(rim);

    // Subtle glass reflection
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(0.022, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        roughness: 0.02,
        transparent: true,
        opacity: 0.3,
      })
    );
    lens.position.set(gx, 0, 0.002);
    glassesGroup.add(lens);
  });

  headGroup.add(glassesGroup);

  // Professional Layered Haircut
  const hairGroup = new THREE.Group();
  hairGroup.position.set(0, 0.135, -0.01);

  // Top hair volume with side part
  const hairTopGeo = new THREE.SphereGeometry(0.128, 24, 16);
  hairTopGeo.scale(0.96, 0.85, 1.15);
  const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
  hairTop.position.set(0, 0.03, -0.01);
  hairGroup.add(hairTop);

  // Front parted swoop
  const swoopGeo = new THREE.CylinderGeometry(0.025, 0.04, 0.12, 12);
  const swoop = new THREE.Mesh(swoopGeo, hairMat);
  swoop.rotation.z = Math.PI / 2 - 0.2;
  swoop.position.set(-0.02, 0.065, 0.08);
  hairGroup.add(swoop);

  // Back and side taper
  const hairBackGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.14, 16);
  const hairBack = new THREE.Mesh(hairBackGeo, hairMat);
  hairBack.position.set(0, -0.04, -0.06);
  hairGroup.add(hairBack);

  headGroup.add(hairGroup);

  // 5. Mouth & Articulated Lower Jaw (For Talking & Expression Animations)
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, 0.0, 0.095);
  headGroup.add(mouthGroup);

  // Upper Lip (Fixed to head)
  const upperLipGeo = new THREE.TorusGeometry(0.024, 0.007, 8, 16, Math.PI * 0.9);
  const upperLip = new THREE.Mesh(upperLipGeo, lipMat);
  upperLip.rotation.x = Math.PI;
  upperLip.rotation.z = Math.PI;
  upperLip.position.set(0, 0.008, 0.012);
  mouthGroup.add(upperLip);

  // Upper Teeth row
  const teethUpperGeo = new THREE.BoxGeometry(0.032, 0.009, 0.008);
  const teethUpper = new THREE.Mesh(teethUpperGeo, teethMat);
  teethUpper.position.set(0, 0.003, 0.008);
  mouthGroup.add(teethUpper);

  // Articulated Jaw Group (Rotates and moves down when speaking!)
  const jawGroup = new THREE.Group();
  jawGroup.position.set(0, -0.01, 0.01);
  mouthGroup.add(jawGroup);

  // Lower Lip
  const lowerLipGeo = new THREE.TorusGeometry(0.022, 0.007, 8, 16, Math.PI * 0.9);
  const lowerLip = new THREE.Mesh(lowerLipGeo, lipMat);
  lowerLip.rotation.x = Math.PI;
  lowerLip.position.set(0, -0.006, 0.003);
  jawGroup.add(lowerLip);

  // Lower Teeth row
  const teethLowerGeo = new THREE.BoxGeometry(0.03, 0.008, 0.008);
  const teethLower = new THREE.Mesh(teethLowerGeo, teethMat);
  teethLower.position.set(0, -0.004, 0.0);
  jawGroup.add(teethLower);

  // Chin & Jawline
  const chinGeo = new THREE.SphereGeometry(0.045, 16, 16);
  chinGeo.scale(1.0, 0.85, 1.1);
  const chin = new THREE.Mesh(chinGeo, skinMat);
  chin.position.set(0, -0.045, -0.01);
  jawGroup.add(chin);

  // 6. Arms & Natural Hands Resting on the Desk
  const armMat = suitMat;
  const cuffMat = shirtMat;

  // Left Arm Group
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.28, 0.38, 0.0);
  chestGroup.add(leftArmGroup);

  // Left Shoulder sleeve
  const leftShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), armMat);
  leftArmGroup.add(leftShoulderCap);

  // Left Upper Arm (Drapes down toward desk)
  const leftUpperArmGeo = new THREE.CylinderGeometry(0.07, 0.062, 0.28, 16);
  const leftUpperArm = new THREE.Mesh(leftUpperArmGeo, armMat);
  leftUpperArm.position.set(0, -0.12, 0.06);
  leftUpperArm.rotation.x = 0.6;
  leftUpperArm.rotation.z = 0.15;
  leftArmGroup.add(leftUpperArm);

  // Left Forearm (Resting forward horizontally onto the desk)
  const leftForearmGeo = new THREE.CylinderGeometry(0.06, 0.052, 0.3, 16);
  const leftForearm = new THREE.Mesh(leftForearmGeo, armMat);
  leftForearm.position.set(0.06, -0.22, 0.28);
  leftForearm.rotation.x = Math.PI / 2 - 0.12;
  leftForearm.rotation.y = -0.25;
  leftArmGroup.add(leftForearm);

  // White shirt cuff peeking out
  const leftCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.03, 16), cuffMat);
  leftCuff.position.set(0.08, -0.22, 0.43);
  leftCuff.rotation.x = Math.PI / 2;
  leftArmGroup.add(leftCuff);

  // Left Hand with sculpted palm and fingers resting on desk
  const leftHandGroup = new THREE.Group();
  leftHandGroup.position.set(0.085, -0.22, 0.48);
  leftArmGroup.add(leftHandGroup);

  const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.024, 0.09), skinMat);
  leftHandGroup.add(leftPalm);

  // Fingers gently curved
  [-0.028, -0.01, 0.01, 0.028].forEach((fx, i) => {
    const fingerLen = 0.045 - Math.abs(i - 1.5) * 0.006;
    const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.006, fingerLen, 8), skinMat);
    finger.rotation.x = Math.PI / 2 + 0.15;
    finger.position.set(fx, -0.004, 0.05 + fingerLen / 2);
    leftHandGroup.add(finger);
  });

  // Thumb
  const leftThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.007, 0.038, 8), skinMat);
  leftThumb.rotation.z = 0.6;
  leftThumb.rotation.x = Math.PI / 3;
  leftThumb.position.set(0.042, 0.002, 0.025);
  leftHandGroup.add(leftThumb);

  // Right Arm Group
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.28, 0.38, 0.0);
  chestGroup.add(rightArmGroup);

  const rightShoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), armMat);
  rightArmGroup.add(rightShoulderCap);

  const rightUpperArmGeo = new THREE.CylinderGeometry(0.07, 0.062, 0.28, 16);
  const rightUpperArm = new THREE.Mesh(rightUpperArmGeo, armMat);
  rightUpperArm.position.set(0, -0.12, 0.06);
  rightUpperArm.rotation.x = 0.6;
  rightUpperArm.rotation.z = -0.15;
  rightArmGroup.add(rightUpperArm);

  const rightForearmGeo = new THREE.CylinderGeometry(0.06, 0.052, 0.3, 16);
  const rightForearm = new THREE.Mesh(rightForearmGeo, armMat);
  rightForearm.position.set(-0.06, -0.22, 0.28);
  rightForearm.rotation.x = Math.PI / 2 - 0.12;
  rightForearm.rotation.y = 0.25;
  rightArmGroup.add(rightForearm);

  const rightCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.03, 16), cuffMat);
  rightCuff.position.set(-0.08, -0.22, 0.43);
  rightCuff.rotation.x = Math.PI / 2;
  rightArmGroup.add(rightCuff);

  const rightHandGroup = new THREE.Group();
  rightHandGroup.position.set(-0.085, -0.22, 0.48);
  rightArmGroup.add(rightHandGroup);

  const rightPalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.024, 0.09), skinMat);
  rightHandGroup.add(rightPalm);

  [-0.028, -0.01, 0.01, 0.028].forEach((fx, i) => {
    const fingerLen = 0.045 - Math.abs(i - 1.5) * 0.006;
    const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.006, fingerLen, 8), skinMat);
    finger.rotation.x = Math.PI / 2 + 0.15;
    finger.position.set(fx, -0.004, 0.05 + fingerLen / 2);
    rightHandGroup.add(finger);
  });

  const rightThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.007, 0.038, 8), skinMat);
  rightThumb.rotation.z = -0.6;
  rightThumb.rotation.x = Math.PI / 3;
  rightThumb.position.set(-0.042, 0.002, 0.025);
  rightHandGroup.add(rightThumb);

  const refs: ProceduralAvatarRefs = {
    rootGroup: root,
    chestGroup,
    neckGroup,
    headGroup,
    jawGroup,
    mouthGroup,
    upperLip,
    lowerLip,
    teethUpper,
    teethLower,
    leftEyelidUpper,
    leftEyelidLower,
    rightEyelidUpper,
    rightEyelidLower,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    leftArmGroup,
    rightArmGroup,
    leftHandGroup,
    rightHandGroup,
  };

  return { group: root, refs };
}

/**
 * Avatar Controller that manages both Procedural Avatar and Custom GLB Avatar,
 * handling state machine (IDLE, LISTENING, THINKING, SPEAKING, NODDING),
 * smooth mouth talking animations, blinking, head gestures, and user tuning.
 */
export class AvatarController {
  public root: THREE.Group;
  public state: AvatarState = 'IDLE';
  public config: AvatarConfig = { ...DEFAULT_AVATAR_CONFIG };

  // Status flags
  public isGlbLoaded: boolean = false;
  public modelSource: 'procedural' | 'glb' = 'procedural';
  public glbError: string | null = null;

  // Procedural references
  private proceduralRefs: ProceduralAvatarRefs | null = null;
  private proceduralMeshGroup: THREE.Group | null = null;

  // GLB references
  private glbScene: THREE.Group | null = null;
  private glbMixer: THREE.AnimationMixer | null = null;
  private glbMorphMeshes: THREE.Mesh[] = [];

  // Internal animation state clocks
  private time: number = 0;
  private stateTimer: number = 0;
  private blinkTimer: number = 0;
  private isBlinking: boolean = false;
  private nodProgress: number = 0;
  private speechVisemeClock: number = 0;

  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'AvatarControllerRoot';
    this.applyTransform();

    // 1. Build & mount procedural realistic human avatar immediately
    const procedural = buildProceduralHumanAvatar();
    this.proceduralRefs = procedural.refs;
    this.proceduralMeshGroup = procedural.group;
    this.root.add(this.proceduralMeshGroup);

    // 2. Attempt to load custom GLB model in background
    this.tryLoadGlbModel();
  }

  public setConfig(newConfig: Partial<AvatarConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.applyTransform();
  }

  public setState(newState: AvatarState) {
    this.state = newState;
    this.stateTimer = 0;
    if (newState === 'NODDING') {
      this.nodProgress = 0;
    }
  }

  private applyTransform() {
    this.root.position.set(
      this.config.positionX,
      this.config.positionY + this.config.sittingHeightOffset,
      this.config.positionZ
    );
    this.root.rotation.y = this.config.rotationY;
    this.root.scale.setScalar(this.config.scale);
  }

  /**
   * Tries loading `/src/assets/models/interviewer.glb`.
   * If found and valid, smoothly replaces procedural avatar.
   * If missing or 404s, retains procedural realistic avatar gracefully without errors.
   */
  public tryLoadGlbModel() {
    const loader = new GLTFLoader();
    const modelUrl = '/src/assets/models/interviewer.glb';

    loader.load(
      modelUrl,
      (gltf) => {
        this.glbScene = gltf.scene;
        this.glbScene.name = 'CustomGLBInterviewer';

        // Position and scale GLB model appropriately for the chair
        this.glbScene.position.set(0, 0, 0);
        this.glbScene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.morphTargetDictionary) {
              this.glbMorphMeshes.push(mesh);
            }
          }
        });

        if (gltf.animations && gltf.animations.length > 0) {
          this.glbMixer = new THREE.AnimationMixer(this.glbScene);
          const idleAction = this.glbMixer.clipAction(gltf.animations[0]);
          idleAction.play();
        }

        // Hide procedural model and show GLB
        if (this.proceduralMeshGroup) {
          this.proceduralMeshGroup.visible = false;
        }
        this.root.add(this.glbScene);
        this.isGlbLoaded = true;
        this.modelSource = 'glb';
        this.glbError = null;
      },
      undefined,
      (error) => {
        // Expected fallback when file is not yet uploaded
        this.isGlbLoaded = false;
        this.modelSource = 'procedural';
        this.glbError = 'interviewer.glb not found (running high-fidelity procedural avatar)';
        if (this.proceduralMeshGroup) {
          this.proceduralMeshGroup.visible = true;
        }
      }
    );
  }

  /**
   * Main per-frame update loop called from the Three.js render loop.
   */
  public update(delta: number) {
    this.time += delta;
    this.stateTimer += delta;

    // Update GLB mixer if loaded
    if (this.glbMixer) {
      this.glbMixer.update(delta);
    }

    // Update Blinking
    this.blinkTimer += delta;
    if (!this.isBlinking && this.blinkTimer > 3.4 + Math.sin(this.time * 0.5) * 1.2) {
      this.isBlinking = true;
      this.blinkTimer = 0;
    }

    let blinkVal = 0; // 0 = open, 1 = fully closed
    if (this.isBlinking) {
      if (this.blinkTimer < 0.08) {
        blinkVal = this.blinkTimer / 0.08;
      } else if (this.blinkTimer < 0.16) {
        blinkVal = 1 - (this.blinkTimer - 0.08) / 0.08;
      } else {
        this.isBlinking = false;
        this.blinkTimer = 0;
        blinkVal = 0;
      }
    }

    // State Machine calculations
    const idleFactor = this.config.idleIntensity;
    const breath = Math.sin(this.time * 2.0) * 0.012 * idleFactor;

    let targetHeadPitch = 0;
    let targetHeadYaw = 0;
    let targetHeadRoll = 0;
    let mouthAperture = 0; // 0 = closed, 1 = wide open

    switch (this.state) {
      case 'IDLE': {
        // Natural relaxed posture with micro movements
        targetHeadPitch = Math.sin(this.time * 0.8) * 0.02 * idleFactor;
        targetHeadYaw = Math.sin(this.time * 0.4) * 0.025 * idleFactor;
        targetHeadRoll = Math.sin(this.time * 0.3) * 0.015 * idleFactor;
        mouthAperture = 0;
        break;
      }

      case 'LISTENING': {
        // Attentive forward engagement, direct eye contact, occasional slow affirmative nod
        targetHeadPitch = -0.04 + Math.sin(this.time * 0.6) * 0.02; // slight attentive forward tilt
        targetHeadYaw = Math.sin(this.time * 0.3) * 0.015; // steady lock on candidate
        targetHeadRoll = 0.025; // slight curious tilt
        mouthAperture = 0;

        // Occasional gentle understanding nod every 5 seconds
        if (Math.sin(this.time * 1.2) > 0.85) {
          targetHeadPitch += 0.04;
        }
        break;
      }

      case 'THINKING': {
        // Thoughtful cognitive pause: head tilts upward and sideways
        targetHeadPitch = -0.06 + Math.sin(this.time * 0.5) * 0.02;
        targetHeadYaw = 0.08 + Math.sin(this.time * 0.3) * 0.03;
        targetHeadRoll = -0.04;
        mouthAperture = 0.05 * Math.sin(this.time * 1.5);
        break;
      }

      case 'SPEAKING': {
        // Active speaking: speech cadence mouth movement + rhythmic head nods
        this.speechVisemeClock += delta * 12.0 * this.config.speakingSpeed;
        
        // Multi-frequency mouth open/close simulating syllables and phonemes
        const syllable1 = Math.abs(Math.sin(this.speechVisemeClock));
        const syllable2 = Math.abs(Math.sin(this.speechVisemeClock * 0.65 + 0.5));
        const syllable3 = Math.max(0, Math.sin(this.speechVisemeClock * 1.8));
        mouthAperture = THREE.MathUtils.clamp((syllable1 * 0.6 + syllable2 * 0.3 + syllable3 * 0.2), 0.05, 0.85);

        // Natural cadence head movement while explaining
        targetHeadPitch = -0.02 + Math.sin(this.speechVisemeClock * 0.3) * 0.04;
        targetHeadYaw = Math.sin(this.speechVisemeClock * 0.2) * 0.04;
        targetHeadRoll = Math.sin(this.speechVisemeClock * 0.25) * 0.025;
        break;
      }

      case 'NODDING': {
        // Explicit affirmative nod sequence
        this.nodProgress += delta * 3.5;
        const nodAngle = Math.sin(this.nodProgress * Math.PI) * 0.12;
        targetHeadPitch = nodAngle;
        mouthAperture = 0;

        if (this.nodProgress >= 2.0) {
          this.setState('LISTENING');
        }
        break;
      }
    }

    // Apply animation to Procedural Model
    if (this.proceduralRefs && this.modelSource === 'procedural') {
      const refs = this.proceduralRefs;

      // Breathing: Chest expansion
      refs.chestGroup.scale.set(1 + breath * 0.5, 1 + breath, 1 + breath * 0.8);
      refs.chestGroup.position.y = 0.62 + breath * 0.15;

      // Head Orientation (Smoothed with lerp)
      refs.headGroup.rotation.x = THREE.MathUtils.lerp(refs.headGroup.rotation.x, targetHeadPitch, 0.12);
      refs.headGroup.rotation.y = THREE.MathUtils.lerp(refs.headGroup.rotation.y, targetHeadYaw, 0.12);
      refs.headGroup.rotation.z = THREE.MathUtils.lerp(refs.headGroup.rotation.z, targetHeadRoll, 0.12);

      // Blinking: Rotate eyelids over eyeballs
      const eyelidAngle = blinkVal * 0.85;
      refs.leftEyelidUpper.rotation.x = 0.35 + eyelidAngle;
      refs.leftEyelidLower.rotation.x = -0.3 - eyelidAngle * 0.5;
      refs.rightEyelidUpper.rotation.x = 0.35 + eyelidAngle;
      refs.rightEyelidLower.rotation.x = -0.3 - eyelidAngle * 0.5;

      // Mouth & Jaw Movement for Speaking
      refs.jawGroup.position.y = -0.01 - mouthAperture * 0.022;
      refs.jawGroup.rotation.x = mouthAperture * 0.28;
      refs.lowerLip.scale.y = 1.0 + mouthAperture * 0.4;
      refs.upperLip.position.y = 0.008 + mouthAperture * 0.004;

      // Eyebrows subtle expression
      if (this.state === 'SPEAKING' || this.state === 'LISTENING') {
        refs.leftBrow.position.y = 0.11 + Math.sin(this.time * 2.0) * 0.003;
        refs.rightBrow.position.y = 0.11 + Math.sin(this.time * 2.0) * 0.003;
      } else if (this.state === 'THINKING') {
        refs.leftBrow.position.y = 0.115;
        refs.rightBrow.position.y = 0.108;
      }
    }

    // Apply morph targets to GLB if available (Ready Player Me / ARKit standards)
    if (this.glbMorphMeshes.length > 0 && this.modelSource === 'glb') {
      this.glbMorphMeshes.forEach((mesh) => {
        const dict = mesh.morphTargetDictionary;
        const influences = mesh.morphTargetInfluences;
        if (!dict || !influences) return;

        // Blinking
        ['eyeBlinkLeft', 'eyeBlinkRight', 'blink', 'eyesClosed'].forEach((key) => {
          if (dict[key] !== undefined) {
            influences[dict[key]] = blinkVal;
          }
        });

        // Mouth Talking
        ['jawOpen', 'mouthOpen', 'viseme_aa', 'viseme_O', 'mouthSmile'].forEach((key) => {
          if (dict[key] !== undefined) {
            influences[dict[key]] = mouthAperture;
          }
        });
      });
    }
  }
}
