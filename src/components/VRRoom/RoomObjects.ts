import * as THREE from 'three';
import {
  createParquetFloorTexture,
  createCarpetTexture,
  createCeilingTexture,
  createWoodSlatsTexture,
  createLaptopScreenTexture,
  createWhiteboardTexture,
  createNotepadTexture,
  createNameplateTexture,
  createDoorSignTexture,
} from './Textures.ts';

// Room dimensions in meters (Standard corporate executive conference/interview room)
export const ROOM_WIDTH = 6.2; // X axis
export const ROOM_HEIGHT = 3.0; // Y axis
export const ROOM_DEPTH = 6.8; // Z axis

// Candidate seat position (First person default start position)
export const CANDIDATE_SEAT_POS = new THREE.Vector3(0, 1.25, 1.2);
export const INTERVIEWER_SEAT_POS = new THREE.Vector3(0, 1.3, -1.35);

export interface AvatarRef {
  head: THREE.Group;
  chest: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
}

/**
 * Creates the complete room architecture: walls, ceiling, floor, accent slatted wall,
 * large window with city skyline, and conference door.
 */
export function buildRoomShell(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'RoomShell';

  const parquetTexture = createParquetFloorTexture();
  const ceilingTexture = createCeilingTexture();
  const slatsTexture = createWoodSlatsTexture();

  // 1. FLOOR
  const floorGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
  const floorMat = new THREE.MeshStandardMaterial({
    map: parquetTexture,
    roughness: 0.35,
    metalness: 0.05,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  group.add(floor);

  // Executive rug under interview table and chairs
  const rugGeo = new THREE.PlaneGeometry(3.6, 4.2);
  const rugMat = new THREE.MeshStandardMaterial({
    map: createCarpetTexture(),
    roughness: 0.85,
    metalness: 0.0,
  });
  const rug = new THREE.Mesh(rugGeo, rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.005, 0);
  rug.receiveShadow = true;
  group.add(rug);

  // 2. CEILING
  const ceilingGeo = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH);
  const ceilingMat = new THREE.MeshStandardMaterial({
    map: ceilingTexture,
    roughness: 0.9,
    metalness: 0.05,
    color: 0xfcfcfc,
  });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM_HEIGHT;
  ceiling.receiveShadow = true;
  group.add(ceiling);

  // Ceiling light fixtures (Recessed 60x60cm LED panels)
  const panelGeo = new THREE.BoxGeometry(0.7, 0.04, 1.4);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xfff3e0,
    emissiveIntensity: 0.9,
    roughness: 0.2,
  });

  const lightPositions = [
    [-1.2, ROOM_HEIGHT - 0.02, -1.0],
    [1.2, ROOM_HEIGHT - 0.02, -1.0],
    [-1.2, ROOM_HEIGHT - 0.02, 1.2],
    [1.2, ROOM_HEIGHT - 0.02, 1.2],
  ];

  lightPositions.forEach(([lx, ly, lz]) => {
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(lx, ly, lz);
    group.add(panel);

    // Subtle aluminum frame around panel
    const frameGeo = new THREE.BoxGeometry(0.74, 0.02, 1.44);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(lx, ly + 0.01, lz);
    group.add(frame);
  });

  // 3. WALLS
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf3f4f6, // Crisp light corporate grey
    roughness: 0.85,
  });

  // Baseboards / Skirting boards material
  const skirtingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

  // A. Back Wall (behind interviewer, Z = -ROOM_DEPTH / 2)
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT), wallMat);
  backWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Architectural wood slat accent feature in center of back wall
  const accentWall = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, ROOM_HEIGHT, 0.05),
    new THREE.MeshStandardMaterial({
      map: slatsTexture,
      roughness: 0.45,
      metalness: 0.1,
    })
  );
  accentWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + 0.025);
  accentWall.receiveShadow = true;
  group.add(accentWall);

  // B. Front Wall (behind candidate, Z = +ROOM_DEPTH / 2)
  const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT), wallMat);
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2);
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // C. Left Wall (X = -ROOM_WIDTH / 2)
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT), wallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // D. Right Wall with Large Window Cutout (X = +ROOM_WIDTH / 2)
  // Right wall has large panoramic window looking out to the cityscape
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT), wallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  // Add skirting boards
  const skirtBack = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.1, 0.02), skirtingMat);
  skirtBack.position.set(0, 0.05, -ROOM_DEPTH / 2 + 0.01);
  group.add(skirtBack);

  const skirtLeft = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.1, ROOM_DEPTH), skirtingMat);
  skirtLeft.position.set(-ROOM_WIDTH / 2 + 0.01, 0.05, 0);
  group.add(skirtLeft);

  const skirtFront = new THREE.Mesh(new THREE.BoxGeometry(ROOM_WIDTH, 0.1, 0.02), skirtingMat);
  skirtFront.position.set(0, 0.05, ROOM_DEPTH / 2 - 0.01);
  group.add(skirtFront);

  return group;
}

/**
 * Builds the panoramic glass window on the right wall with city skyline backdrop.
 */
export function buildWindowAndSkyline(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'WindowSystem';

  const windowWidth = 4.6;
  const windowHeight = 2.2;
  const windowX = ROOM_WIDTH / 2 - 0.01;
  const windowY = 1.45;
  const windowZ = 0.0;

  // Window frame (Dark charcoal aluminum)
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.2,
  });

  // Outer frame
  const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(0.08, windowHeight + 0.1, windowWidth + 0.1), frameMat);
  outerFrame.position.set(windowX, windowY, windowZ);
  group.add(outerFrame);

  // Window glass with subtle tint and reflection
  const glassGeo = new THREE.BoxGeometry(0.02, windowHeight, windowWidth);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.85,
    transparent: true,
    opacity: 0.35,
  });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(windowX - 0.01, windowY, windowZ);
  group.add(glass);

  // Vertical Mullions (dividers)
  [-1.15, 0, 1.15].forEach((offsetZ) => {
    const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, windowHeight, 0.04), frameMat);
    mullion.position.set(windowX, windowY, windowZ + offsetZ);
    group.add(mullion);
  });

  // Horizontal Mullion
  const hMullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, windowWidth), frameMat);
  hMullion.position.set(windowX, windowY + 0.4, windowZ);
  group.add(hMullion);

  // Exterior City Skyline Backdrop
  const textureLoader = new THREE.TextureLoader();
  const skylineTexture = textureLoader.load('/src/assets/images/city_skyline_window_1791283793777.jpg');

  const backdropGeo = new THREE.PlaneGeometry(8.5, 4.8);
  const backdropMat = new THREE.MeshBasicMaterial({
    map: skylineTexture,
    side: THREE.DoubleSide,
  });
  const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
  backdrop.rotation.y = -Math.PI / 2;
  backdrop.position.set(windowX + 0.8, windowY + 0.2, windowZ);
  group.add(backdrop);

  // Window Sill shelf
  const sillGeo = new THREE.BoxGeometry(0.24, 0.06, windowWidth + 0.2);
  const sillMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const sill = new THREE.Mesh(sillGeo, sillMat);
  sill.position.set(windowX - 0.1, windowY - windowHeight / 2 - 0.03, windowZ);
  group.add(sill);

  return group;
}

/**
 * Builds the conference entrance door on the front wall.
 */
export function buildDoor(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'EntranceDoor';

  const doorWidth = 1.1;
  const doorHeight = 2.4;
  const doorX = -1.8;
  const doorZ = ROOM_DEPTH / 2 - 0.03;

  // Door Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(doorWidth + 0.12, doorHeight + 0.06, 0.08), frameMat);
  frame.position.set(doorX, doorHeight / 2, doorZ);
  group.add(frame);

  // Door Leaf (Frosted glass & dark walnut composite)
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(doorWidth, doorHeight, 0.05), leafMat);
  leaf.position.set(doorX, doorHeight / 2, doorZ - 0.01);
  group.add(leaf);

  // Frosted Vision glass strip in door
  const visionGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 1.4, 0.06),
    new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.8,
      transparent: true,
      opacity: 0.6,
      roughness: 0.5,
    })
  );
  visionGlass.position.set(doorX + 0.2, 1.4, doorZ - 0.01);
  group.add(visionGlass);

  // Stainless steel handle
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.45, 16), handleMat);
  handle.position.set(doorX + 0.44, 1.05, doorZ - 0.06);
  group.add(handle);

  // Door Sign: ROOM 402 - CAREER SPRINT SUITE
  const signGeo = new THREE.PlaneGeometry(0.38, 0.19);
  const signMat = new THREE.MeshStandardMaterial({
    map: createDoorSignTexture(),
    roughness: 0.3,
  });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(doorX, 1.75, doorZ - 0.04);
  sign.rotation.y = Math.PI;
  group.add(sign);

  return group;
}

/**
 * Builds the executive interviewer desk with modesty panel, silver legs,
 * cable port, and leather blotter.
 */
export function buildInterviewerDesk(): THREE.Group {
  const desk = new THREE.Group();
  desk.name = 'InterviewerDesk';

  const deskWidth = 2.1;
  const deskDepth = 1.0;
  const deskThickness = 0.06;
  const deskHeight = 0.75;
  const deskCenterZ = -0.55;

  // Walnut desk top with beveled profile
  const topGeo = new THREE.BoxGeometry(deskWidth, deskThickness, deskDepth);
  const topMat = new THREE.MeshStandardMaterial({
    color: 0x4a2e1b, // Rich dark walnut
    roughness: 0.3,
    metalness: 0.05,
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.set(0, deskHeight, deskCenterZ);
  top.castShadow = true;
  top.receiveShadow = true;
  desk.add(top);

  // Leather desk blotter / writing pad
  const blotterGeo = new THREE.BoxGeometry(0.95, 0.008, 0.55);
  const blotterMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.8,
  });
  const blotter = new THREE.Mesh(blotterGeo, blotterMat);
  blotter.position.set(0, deskHeight + deskThickness / 2 + 0.004, deskCenterZ);
  blotter.receiveShadow = true;
  desk.add(blotter);

  // Metal Legs / modern trapezoid sled base
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.25,
  });

  const legPositions = [-deskWidth / 2 + 0.12, deskWidth / 2 - 0.12];
  legPositions.forEach((lx) => {
    // Vertical leg columns
    const legGeo = new THREE.BoxGeometry(0.06, deskHeight - deskThickness, deskDepth - 0.15);
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(lx, (deskHeight - deskThickness) / 2, deskCenterZ);
    leg.castShadow = true;
    desk.add(leg);

    // Chrome feet glide
    const glideGeo = new THREE.BoxGeometry(0.08, 0.02, deskDepth - 0.1);
    const glide = new THREE.Mesh(glideGeo, metalMat);
    glide.position.set(lx, 0.01, deskCenterZ);
    desk.add(glide);
  });

  // Modesty Panel (Front facing the candidate)
  const modestyGeo = new THREE.BoxGeometry(deskWidth - 0.35, 0.45, 0.02);
  const modestyMat = new THREE.MeshStandardMaterial({
    color: 0x2e1c10,
    roughness: 0.4,
  });
  const modesty = new THREE.Mesh(modestyGeo, modestyMat);
  modesty.position.set(0, deskHeight - 0.25, deskCenterZ + deskDepth / 2 - 0.08);
  modesty.castShadow = true;
  desk.add(modesty);

  // Cable grommet (Brushed aluminum ring on desk corner)
  const grommetGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.015, 24);
  const grommetMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
  const grommet = new THREE.Mesh(grommetGeo, grommetMat);
  grommet.position.set(deskWidth / 2 - 0.25, deskHeight + deskThickness / 2 + 0.005, deskCenterZ - deskDepth / 2 + 0.15);
  desk.add(grommet);

  return desk;
}

/**
 * Builds table accessories: Open laptop with dashboard screen, ceramic coffee mug,
 * executive brass nameplate, notepad with pen, conference microphone puck, glass of water.
 */
export function buildTableAccessories(): THREE.Group {
  const accessories = new THREE.Group();
  accessories.name = 'TableAccessories';

  const deskY = 0.75 + 0.03; // Surface of desk
  const deskCenterZ = -0.55;

  // 1. LAPTOP (Aluminum unibody MacBook Pro style)
  const laptop = new THREE.Group();
  laptop.position.set(-0.15, deskY, deskCenterZ - 0.05);

  const aluMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.3,
  });

  // Base
  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.012, 0.24), aluMat);
  laptopBase.position.set(0, 0.006, 0);
  laptopBase.castShadow = true;
  laptop.add(laptopBase);

  // Keyboard recess & keys
  const keyboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.003, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 })
  );
  keyboard.position.set(0, 0.013, -0.03);
  laptop.add(keyboard);

  // Trackpad
  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.002, 0.07),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
  );
  trackpad.position.set(0, 0.013, 0.06);
  laptop.add(trackpad);

  // Screen Lid (Opened at ~110 degrees)
  const screenLid = new THREE.Group();
  screenLid.position.set(0, 0.012, -0.12);
  screenLid.rotation.x = THREE.MathUtils.degToRad(-108);

  const screenChassis = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.008), aluMat);
  screenChassis.position.set(0, 0.12, 0);
  screenChassis.castShadow = true;
  screenLid.add(screenChassis);

  // Screen Display with Career Sprint Interview Dashboard
  const screenTexture = createLaptopScreenTexture();
  const screenDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.31, 0.2),
    new THREE.MeshBasicMaterial({
      map: screenTexture,
    })
  );
  screenDisplay.position.set(0, 0.12, -0.005);
  screenDisplay.rotation.y = Math.PI;
  screenLid.add(screenDisplay);

  laptop.add(screenLid);
  laptop.rotation.y = THREE.MathUtils.degToRad(8); // Angled slightly towards interviewer
  accessories.add(laptop);

  // Screen glow light onto interviewer
  const screenLight = new THREE.PointLight(0x38bdf8, 0.6, 1.2);
  screenLight.position.set(-0.15, deskY + 0.15, deskCenterZ - 0.25);
  accessories.add(screenLight);

  // 2. CERAMIC COFFEE MUG
  const mug = new THREE.Group();
  mug.position.set(0.48, deskY, deskCenterZ + 0.1);

  const mugMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Career Sprint Blue
    roughness: 0.2,
  });

  const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.09, 24), mugMat);
  mugBody.position.y = 0.045;
  mugBody.castShadow = true;
  mug.add(mugBody);

  // Mug handle
  const handleGeo = new THREE.TorusGeometry(0.024, 0.008, 12, 24, Math.PI);
  const handleMesh = new THREE.Mesh(handleGeo, mugMat);
  handleMesh.position.set(0.045, 0.045, 0);
  handleMesh.rotation.z = -Math.PI / 2;
  mug.add(handleMesh);

  // Coffee liquid inside
  const coffeeGeo = new THREE.CylinderGeometry(0.037, 0.037, 0.01, 24);
  const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x2b1509, roughness: 0.1 });
  const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
  coffee.position.y = 0.082;
  mug.add(coffee);

  accessories.add(mug);

  // 3. SPIRAL NOTEPAD WITH PEN
  const notepad = new THREE.Group();
  notepad.position.set(0.3, deskY, deskCenterZ - 0.12);
  notepad.rotation.y = THREE.MathUtils.degToRad(-15);

  const notepadMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.01, 0.24),
    new THREE.MeshStandardMaterial({
      map: createNotepadTexture(),
      roughness: 0.8,
    })
  );
  notepadMesh.position.y = 0.005;
  notepadMesh.castShadow = true;
  notepad.add(notepadMesh);

  // Ballpoint pen
  const pen = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.14, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8, roughness: 0.2 })
  );
  pen.rotation.z = Math.PI / 2;
  pen.position.set(0.11, 0.012, 0);
  notepad.add(pen);

  accessories.add(notepad);

  // 4. EXECUTIVE NAMEPLATE
  const nameplate = new THREE.Group();
  nameplate.position.set(-0.55, deskY, deskCenterZ + 0.28);
  nameplate.rotation.y = THREE.MathUtils.degToRad(180); // Facing candidate

  // Triangular prism wooden block
  const blockGeo = new THREE.BoxGeometry(0.3, 0.045, 0.05);
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x2e1c10, roughness: 0.4 });
  const block = new THREE.Mesh(blockGeo, blockMat);
  block.position.y = 0.022;
  block.castShadow = true;
  nameplate.add(block);

  // Brass face
  const brassGeo = new THREE.PlaneGeometry(0.28, 0.038);
  const brassMat = new THREE.MeshStandardMaterial({
    map: createNameplateTexture(),
    metalness: 0.6,
    roughness: 0.3,
  });
  const brass = new THREE.Mesh(brassGeo, brassMat);
  brass.position.set(0, 0.022, 0.026);
  nameplate.add(brass);

  accessories.add(nameplate);

  // 5. CONFERENCE MICROPHONE / SPEAKER PUCK
  const micPuck = new THREE.Group();
  micPuck.position.set(0.0, deskY, deskCenterZ + 0.32);

  const micMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.08, 0.02, 32),
    new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 })
  );
  micMesh.position.y = 0.01;
  micMesh.castShadow = true;
  micPuck.add(micMesh);

  // Green active indicator ring
  const ledRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.05, 0.003, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.y = 0.021;
  micPuck.add(ledRing);

  accessories.add(micPuck);

  // 6. CLEAR WATER GLASS
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.03, 0.11, 24, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.4,
      transparent: true,
      roughness: 0.05,
      ior: 1.5,
    })
  );
  glass.position.set(-0.55, deskY + 0.055, deskCenterZ + 0.1);
  glass.castShadow = true;
  accessories.add(glass);

  return accessories;
}

/**
 * Builds the Interviewer's executive leather swivel chair.
 */
export function buildInterviewerChair(): THREE.Group {
  const chair = new THREE.Group();
  chair.name = 'InterviewerChair';
  chair.position.set(0, 0, -1.35);

  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x1e2229, // Deep executive charcoal leather
    roughness: 0.5,
    metalness: 0.1,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.15,
  });

  // Star base with 5 caster wheels
  const baseCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.06, 16), chromeMat);
  baseCenter.position.y = 0.1;
  chair.add(baseCenter);

  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5;
    const armGeo = new THREE.BoxGeometry(0.03, 0.02, 0.32);
    const arm = new THREE.Mesh(armGeo, chromeMat);
    arm.position.set(Math.sin(angle) * 0.16, 0.08, Math.cos(angle) * 0.16);
    arm.rotation.y = angle;
    chair.add(arm);

    // Caster wheel
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.02, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(Math.sin(angle) * 0.32, 0.024, Math.cos(angle) * 0.32);
    chair.add(wheel);
  }

  // Hydraulic gas lift column
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 16), chromeMat);
  piston.position.y = 0.28;
  chair.add(piston);

  // Seat cushion
  const seatGeo = new THREE.BoxGeometry(0.58, 0.1, 0.54);
  const seat = new THREE.Mesh(seatGeo, leatherMat);
  seat.position.set(0, 0.48, 0.04);
  seat.castShadow = true;
  chair.add(seat);

  // High backrest with ergonomic curve
  const backGeo = new THREE.BoxGeometry(0.54, 0.72, 0.08);
  const back = new THREE.Mesh(backGeo, leatherMat);
  back.position.set(0, 0.88, -0.22);
  back.rotation.x = THREE.MathUtils.degToRad(-6);
  back.castShadow = true;
  chair.add(back);

  // Headrest
  const headrestGeo = new THREE.BoxGeometry(0.32, 0.18, 0.07);
  const headrest = new THREE.Mesh(headrestGeo, leatherMat);
  headrest.position.set(0, 1.32, -0.27);
  headrest.castShadow = true;
  chair.add(headrest);

  // Padded Armrests
  [-0.32, 0.32].forEach((ax) => {
    const armPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 12), chromeMat);
    armPillar.position.set(ax, 0.6, 0.02);
    chair.add(armPillar);

    const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.34), leatherMat);
    armPad.position.set(ax, 0.73, 0.02);
    chair.add(armPad);
  });

  return chair;
}

/**
 * Builds the Candidate's chair (contemporary ergonomic mesh chair facing interviewer desk).
 */
export function buildCandidateChair(): THREE.Group {
  const chair = new THREE.Group();
  chair.name = 'CandidateChair';
  chair.position.set(0, 0, 0.55);
  chair.rotation.y = Math.PI; // Facing desk

  const meshMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // Professional navy mesh
    roughness: 0.6,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Sled cantilever base
  const sledGeo = new THREE.BoxGeometry(0.54, 0.025, 0.58);
  const sledBase = new THREE.Mesh(sledGeo, chromeMat);
  sledBase.position.y = 0.015;
  chair.add(sledBase);

  // Upright supports
  [-0.26, 0.26].forEach((sx) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.46, 12), chromeMat);
    post.position.set(sx, 0.24, -0.22);
    chair.add(post);
  });

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.52, 0.06, 0.48);
  const seat = new THREE.Mesh(seatGeo, meshMat);
  seat.position.set(0, 0.46, 0.0);
  seat.castShadow = true;
  chair.add(seat);

  // Mesh backrest
  const backGeo = new THREE.BoxGeometry(0.48, 0.56, 0.04);
  const back = new THREE.Mesh(backGeo, meshMat);
  back.position.set(0, 0.76, -0.22);
  back.rotation.x = THREE.MathUtils.degToRad(-8);
  back.castShadow = true;
  chair.add(back);

  // Armrests
  [-0.28, 0.28].forEach((ax) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.28), chromeMat);
    arm.position.set(ax, 0.68, -0.05);
    chair.add(arm);
  });

  return chair;
}

/**
 * Builds the realistic stylized 3D Interviewer avatar sitting behind the desk.
 * Includes hooks for idle animations (breathing, subtle head nod, eye blink).
 */
export function buildInterviewerAvatar(): { group: THREE.Group; refs: AvatarRef } {
  const avatarGroup = new THREE.Group();
  avatarGroup.name = 'InterviewerAvatar';
  avatarGroup.position.set(0, 0, -1.35);

  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Tailored navy suit
    roughness: 0.75,
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc, // Crisp white dress shirt
    roughness: 0.6,
  });

  const tieMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // Sprint Blue silk tie
    roughness: 0.4,
    metalness: 0.1,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xe0ac69, // Natural healthy skin tone
    roughness: 0.6,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x27272a, // Dark espresso trimmed hair
    roughness: 0.9,
  });

  // Pelvis / lower body seated
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.32), suitMat);
  pelvis.position.set(0, 0.52, 0);
  avatarGroup.add(pelvis);

  // Thighs extending towards the desk
  [-0.12, 0.12].forEach((tx) => {
    const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.48), suitMat);
    thigh.position.set(tx, 0.54, 0.26);
    avatarGroup.add(thigh);
  });

  // Chest / Torso Group (for breathing animation)
  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 0.64, -0.02);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.28), suitMat);
  torso.position.y = 0.22;
  torso.castShadow = true;
  chestGroup.add(torso);

  // White shirt collar V-shape
  const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.24, 0.02), shirtMat);
  shirtV.position.set(0, 0.32, 0.14);
  chestGroup.add(shirtV);

  // Tie
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.28, 0.025), tieMat);
  tie.position.set(0, 0.25, 0.15);
  chestGroup.add(tie);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 16), skinMat);
  neck.position.set(0, 0.48, 0);
  chestGroup.add(neck);

  // Head Group (for head tilt / nod animation)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.55, 0);

  // Head mesh
  const headGeo = new THREE.BoxGeometry(0.22, 0.26, 0.22);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 0.12;
  head.castShadow = true;
  headGroup.add(head);

  // Hair styling
  const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.24), hairMat);
  hairTop.position.set(0, 0.24, -0.01);
  headGroup.add(hairTop);

  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.18, 0.08), hairMat);
  hairBack.position.set(0, 0.14, -0.09);
  headGroup.add(hairBack);

  // Eyes with blink scaling
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 0.01), eyeMat);
  leftEye.position.set(-0.06, 0.14, 0.115);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.018, 0.01), eyeMat);
  rightEye.position.set(0.06, 0.14, 0.115);
  headGroup.add(rightEye);

  // Eyebrows
  const browMat = new THREE.MeshBasicMaterial({ color: 0x27272a });
  const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.01), browMat);
  leftBrow.position.set(-0.06, 0.165, 0.116);
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.01), browMat);
  rightBrow.position.set(0.06, 0.165, 0.116);
  headGroup.add(rightBrow);

  // Glasses (Professional modern frame)
  const glassesFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
  const glassesBridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.006, 0.015), glassesFrameMat);
  glassesBridge.position.set(0, 0.14, 0.125);
  headGroup.add(glassesBridge);

  [-0.06, 0.06].forEach((gx) => {
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.01), glassesFrameMat);
    rim.position.set(gx, 0.14, 0.125);
    headGroup.add(rim);

    // Glass lens
    const lens = new THREE.Mesh(
      new THREE.PlaneGeometry(0.05, 0.028),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
      })
    );
    lens.position.set(gx, 0.14, 0.131);
    headGroup.add(lens);
  });

  chestGroup.add(headGroup);

  // Arms: Natural posture resting on the desk
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.25, 0.38, 0);
  const leftUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.28, 0.12), suitMat);
  leftUpperArm.position.set(0, -0.12, 0.04);
  leftUpperArm.rotation.x = THREE.MathUtils.degToRad(35);
  leftArmGroup.add(leftUpperArm);

  // Forearm resting forward on desk
  const leftForearm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.32), suitMat);
  leftForearm.position.set(0.04, -0.22, 0.26);
  leftArmGroup.add(leftForearm);

  // Hand
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.1), skinMat);
  leftHand.position.set(0.04, -0.22, 0.44);
  leftArmGroup.add(leftHand);

  chestGroup.add(leftArmGroup);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.25, 0.38, 0);
  const rightUpperArm = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.28, 0.12), suitMat);
  rightUpperArm.position.set(0, -0.12, 0.04);
  rightUpperArm.rotation.x = THREE.MathUtils.degToRad(35);
  rightArmGroup.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.32), suitMat);
  rightForearm.position.set(-0.04, -0.22, 0.26);
  rightArmGroup.add(rightForearm);

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.1), skinMat);
  rightHand.position.set(-0.04, -0.22, 0.44);
  rightArmGroup.add(rightHand);

  chestGroup.add(rightArmGroup);

  avatarGroup.add(chestGroup);

  const refs: AvatarRef = {
    head: headGroup,
    chest: chestGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftEye: leftEye,
    rightEye: rightEye,
  };

  return { group: avatarGroup, refs };
}

/**
 * Builds potted indoor office plants (Large fiddle-leaf plant & desk succulent).
 */
export function buildPlants(): THREE.Group {
  const plants = new THREE.Group();
  plants.name = 'OfficePlants';

  // 1. TALL CORNER PLANT (Next to window, near back right corner)
  const cornerPlant = new THREE.Group();
  cornerPlant.position.set(ROOM_WIDTH / 2 - 0.7, 0, -ROOM_DEPTH / 2 + 0.8);

  // Modern white fluted ceramic pot
  const potGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.55, 24);
  const potMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
  });
  const pot = new THREE.Mesh(potGeo, potMat);
  pot.position.y = 0.275;
  pot.castShadow = true;
  cornerPlant.add(pot);

  // Pot soil
  const soilGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.04, 24);
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x271d18, roughness: 0.95 });
  const soil = new THREE.Mesh(soilGeo, soilMat);
  soil.position.y = 0.53;
  cornerPlant.add(soil);

  // Plant stems & Lush green foliage
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d, // Vibrant healthy emerald
    roughness: 0.35,
    side: THREE.DoubleSide,
  });

  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.7 });

  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const height = 0.65 + (i % 3) * 0.25;

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, height, 8), stemMat);
    stem.position.set(Math.sin(angle) * 0.08, 0.55 + height / 2, Math.cos(angle) * 0.08);
    stem.rotation.z = Math.sin(angle) * 0.18;
    stem.rotation.x = Math.cos(angle) * 0.18;
    cornerPlant.add(stem);

    // Broad tropical leaves
    const leafGeo = new THREE.SphereGeometry(0.18, 12, 12);
    leafGeo.scale(1.2, 0.08, 1.8);
    const leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafMesh.position.set(Math.sin(angle) * 0.28, 0.55 + height + 0.05, Math.cos(angle) * 0.28);
    leafMesh.rotation.y = angle;
    leafMesh.rotation.x = Math.PI / 6;
    leafMesh.castShadow = true;
    cornerPlant.add(leafMesh);
  }

  plants.add(cornerPlant);

  // 2. MINI DESK SUCCULENT (On credenza side table)
  const succulentGroup = new THREE.Group();
  succulentGroup.position.set(-ROOM_WIDTH / 2 + 0.45, 0.76, 1.4);

  const miniPot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.045, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  miniPot.position.y = 0.04;
  succulentGroup.add(miniPot);

  // Succulent rosettes
  const succLeafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.4 });
  for (let r = 0; r < 8; r++) {
    const sAngle = (r * Math.PI * 2) / 8;
    const sLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.06, 8), succLeafMat);
    sLeaf.position.set(Math.sin(sAngle) * 0.03, 0.09, Math.cos(sAngle) * 0.03);
    sLeaf.rotation.x = Math.cos(sAngle) * 0.4;
    sLeaf.rotation.z = -Math.sin(sAngle) * 0.4;
    succulentGroup.add(sLeaf);
  }

  plants.add(succulentGroup);

  return plants;
}

/**
 * Builds wall decorations:
 * 1. Backlit 3D CAREER SPRINT illuminated company brand sign
 * 2. Executive modern abstract framed art painting
 * 3. Interactive whiteboard with architecture diagram & interview agenda
 * 4. Minimalist corporate wall clock
 */
export function buildWallDecorations(): THREE.Group {
  const decorations = new THREE.Group();
  decorations.name = 'WallDecorations';

  // 1. CAREER SPRINT BACKLIT SIGN (On the slatted back wall)
  const logoGroup = new THREE.Group();
  logoGroup.position.set(0, 2.35, -ROOM_DEPTH / 2 + 0.06);

  // Backing plate
  const plateGeo = new THREE.BoxGeometry(2.4, 0.46, 0.02);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.9,
    roughness: 0.2,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  logoGroup.add(plate);

  // Corporate Text Canvas
  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = 1024;
  logoCanvas.height = 256;
  const ctx = logoCanvas.getContext('2d')!;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 1024, 256);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 80px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAREER SPRINT', 512, 115);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('VIRTUAL INTERVIEW SUITE', 512, 185);

  const logoTexture = new THREE.CanvasTexture(logoCanvas);
  const logoMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.36, 0.44),
    new THREE.MeshBasicMaterial({ map: logoTexture })
  );
  logoMesh.position.z = 0.015;
  logoGroup.add(logoMesh);

  // Soft cyan backlight glow behind sign
  const logoLight = new THREE.PointLight(0x38bdf8, 0.8, 2.5);
  logoLight.position.set(0, 0, 0.15);
  logoGroup.add(logoLight);

  decorations.add(logoGroup);

  // 2. MODERN ABSTRACT FRAMED ART (Left wall corner)
  const artGroup = new THREE.Group();
  artGroup.position.set(-ROOM_WIDTH / 2 + 0.04, 1.8, -1.8);
  artGroup.rotation.y = Math.PI / 2;

  // Thin black modern gallery frame
  const artFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.64, 1.04, 0.04),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
  );
  artGroup.add(artFrame);

  // Artwork image canvas
  const artTexture = new THREE.TextureLoader().load('/src/assets/images/interview_room_art_1791283813588.jpg');
  const artCanvasMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.58, 0.98),
    new THREE.MeshStandardMaterial({
      map: artTexture,
      roughness: 0.4,
    })
  );
  artCanvasMesh.position.z = 0.022;
  artGroup.add(artCanvasMesh);

  decorations.add(artGroup);

  // 3. WHITEBOARD WITH SYSTEM ARCHITECTURE & AGENDA (Left wall center)
  const wbGroup = new THREE.Group();
  wbGroup.position.set(-ROOM_WIDTH / 2 + 0.04, 1.6, 0.8);
  wbGroup.rotation.y = Math.PI / 2;

  // Aluminum frame
  const wbFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.26, 1.36, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.25 })
  );
  wbGroup.add(wbFrame);

  // Whiteboard panel
  const wbPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.3),
    new THREE.MeshStandardMaterial({
      map: createWhiteboardTexture(),
      roughness: 0.2,
    })
  );
  wbPanel.position.z = 0.016;
  wbGroup.add(wbPanel);

  // Marker tray with dry-erase markers
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.03, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
  );
  tray.position.set(0, -0.66, 0.04);
  wbGroup.add(tray);

  decorations.add(wbGroup);

  // 4. MINIMALIST WALL CLOCK (Above whiteboard)
  const clockGroup = new THREE.Group();
  clockGroup.position.set(-ROOM_WIDTH / 2 + 0.03, 2.5, 0.8);
  clockGroup.rotation.y = Math.PI / 2;

  // Clock casing
  const clockBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.03, 32),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 })
  );
  clockBody.rotation.x = Math.PI / 2;
  clockGroup.add(clockBody);

  // Clock face
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.18, 32),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
  );
  clockFace.position.z = 0.016;
  clockGroup.add(clockFace);

  // Hands (set to 10:15 interview time)
  const hourHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.09, 0.005),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  hourHand.position.set(0.02, 0.02, 0.018);
  hourHand.rotation.z = -Math.PI / 6;
  clockGroup.add(hourHand);

  const minuteHand = new THREE.Mesh(
    new THREE.BoxGeometry(0.008, 0.13, 0.005),
    new THREE.MeshBasicMaterial({ color: 0x0284c7 })
  );
  minuteHand.position.set(0.05, 0.0, 0.018);
  minuteHand.rotation.z = -Math.PI / 2;
  clockGroup.add(minuteHand);

  decorations.add(clockGroup);

  return decorations;
}

/**
 * Builds executive side furniture (low credenza / storage sideboard with binders,
 * tech trophies, and certificates).
 */
export function buildSideFurniture(): THREE.Group {
  const furniture = new THREE.Group();
  furniture.name = 'SideFurniture';

  const credenzaX = -ROOM_WIDTH / 2 + 0.35;
  const credenzaZ = 1.4;

  // Modern walnut credenza sideboard
  const credenzaGeo = new THREE.BoxGeometry(0.55, 0.72, 1.8);
  const credenzaMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723, // Deep walnut
    roughness: 0.4,
  });
  const credenza = new THREE.Mesh(credenzaGeo, credenzaMat);
  credenza.position.set(credenzaX, 0.36, credenzaZ);
  credenza.castShadow = true;
  credenza.receiveShadow = true;
  furniture.add(credenza);

  // Chrome feet
  [-0.7, 0.7].forEach((fz) => {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    foot.position.set(credenzaX, 0.03, credenzaZ + fz);
    furniture.add(foot);
  });

  // Credenza handles
  [-0.4, 0.0, 0.4].forEach((hz) => {
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.08, 0.015),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 })
    );
    handle.position.set(credenzaX + 0.28, 0.45, credenzaZ + hz);
    furniture.add(handle);
  });

  // Acrylic Excellence Award on credenza
  const award = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.18, 0.12),
    new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.85,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    })
  );
  award.position.set(credenzaX, 0.72 + 0.09, credenzaZ - 0.5);
  award.castShadow = true;
  furniture.add(award);

  // Stack of technical books / folders
  const bookColors = [0x1e3a8a, 0x047857, 0xb45309];
  bookColors.forEach((color, idx) => {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.03, 0.28),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    );
    book.position.set(credenzaX - 0.05, 0.72 + 0.015 + idx * 0.03, credenzaZ + 0.4);
    furniture.add(book);
  });

  return furniture;
}

/**
 * Creates realistic, optimized lighting setup for the interview room:
 * - Soft ambient light for natural diffuse fill
 * - Sun directional light streaming in through the panoramic window casting realistic shadows
 * - Warmer ceiling spotlights focused on the interview desk and whiteboard
 */
export function buildLighting(): {
  group: THREE.Group;
  deskSpot: THREE.SpotLight;
  windowLight: THREE.DirectionalLight;
  ambientLight: THREE.AmbientLight;
} {
  const group = new THREE.Group();
  group.name = 'LightingSystem';

  // 1. Soft Ambient Fill
  const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.65);
  group.add(ambientLight);

  // 2. Sunlight through the panoramic window (Right wall)
  const windowLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
  windowLight.position.set(ROOM_WIDTH / 2 + 2.5, 2.6, 0.2);
  windowLight.target.position.set(0, 0.8, -0.4);
  windowLight.castShadow = true;

  // Calibrated shadow map for clean sharp performance
  windowLight.shadow.mapSize.width = 2048;
  windowLight.shadow.mapSize.height = 2048;
  windowLight.shadow.camera.near = 0.5;
  windowLight.shadow.camera.far = 12;
  windowLight.shadow.camera.left = -4;
  windowLight.shadow.camera.right = 4;
  windowLight.shadow.camera.top = 3.5;
  windowLight.shadow.camera.bottom = -3.5;
  windowLight.shadow.bias = -0.0005;

  group.add(windowLight);
  group.add(windowLight.target);

  // 3. Desk Overhead Spotlight (Warm professional key light on interviewer & desk)
  const deskSpot = new THREE.SpotLight(0xffedd5, 1.2, 5.0, Math.PI / 4, 0.35, 1.0);
  deskSpot.position.set(0, ROOM_HEIGHT - 0.05, -0.6);
  deskSpot.target.position.set(0, 0.75, -0.55);
  deskSpot.castShadow = true;
  deskSpot.shadow.mapSize.width = 1024;
  deskSpot.shadow.mapSize.height = 1024;
  deskSpot.shadow.bias = -0.0005;

  group.add(deskSpot);
  group.add(deskSpot.target);

  // 4. Whiteboard Accent Light
  const wbSpot = new THREE.SpotLight(0xe0f2fe, 0.7, 4.0, Math.PI / 5, 0.4);
  wbSpot.position.set(-ROOM_WIDTH / 2 + 1.2, ROOM_HEIGHT - 0.1, 0.8);
  wbSpot.target.position.set(-ROOM_WIDTH / 2, 1.6, 0.8);
  group.add(wbSpot);
  group.add(wbSpot.target);

  return { group, deskSpot, windowLight, ambientLight };
}
