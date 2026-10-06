import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  buildRoomShell,
  buildWindowAndSkyline,
  buildDoor,
  buildInterviewerDesk,
  buildTableAccessories,
  buildInterviewerChair,
  buildCandidateChair,
  buildPlants,
  buildWallDecorations,
  buildSideFurniture,
  buildLighting,
  CANDIDATE_SEAT_POS,
} from './RoomObjects.ts';
import {
  AvatarController,
  AvatarConfig,
  AvatarState,
  DEFAULT_AVATAR_CONFIG,
} from './InterviewerAvatar.ts';
import { FirstPersonControls, CAMERA_PRESETS } from './VRControls.ts';
import { OfficeAudioAmbiance } from './AudioAmbiance.ts';
import { HUDOverlay } from '../UI/HUDOverlay.tsx';
import { MobileControls } from '../UI/MobileControls.tsx';
import { HelpModal } from '../UI/HelpModal.tsx';
import { AvatarDevSettings } from '../UI/AvatarDevSettings.tsx';

export function InterviewRoomScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  // Status & VR state
  const [vrSupported, setVrSupported] = useState<boolean | null>(null);
  const [inVr, setInVr] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('candidate');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'evening'>('day');
  const [audioActive, setAudioActive] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Avatar states & settings
  const [avatarState, setAvatarState] = useState<AvatarState>('IDLE');
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  const [showAvatarSettings, setShowAvatarSettings] = useState<boolean>(false);
  const [modelSource, setModelSource] = useState<'procedural' | 'glb'>('procedural');
  const [isGlbLoaded, setIsGlbLoaded] = useState<boolean>(false);

  // References to three objects
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<FirstPersonControls | null>(null);
  const audioRef = useRef<OfficeAudioAmbiance>(new OfficeAudioAmbiance());
  const xrSessionRef = useRef<XRSession | null>(null);
  const avatarControllerRef = useRef<AvatarController | null>(null);
  const lightsRef = useRef<{
    deskSpot: THREE.SpotLight;
    windowLight: THREE.DirectionalLight;
    ambientLight: THREE.AmbientLight;
  } | null>(null);
  const cameraRigRef = useRef<THREE.Group | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouch || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check WebXR support
  useEffect(() => {
    if ('xr' in navigator && navigator.xr) {
      navigator.xr
        .isSessionSupported('immersive-vr')
        .then((supported) => {
          setVrSupported(supported);
        })
        .catch(() => {
          setVrSupported(false);
        });
    } else {
      setVrSupported(false);
    }
  }, []);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    // 2. Camera & Camera Rig
    // We use a rig so that in both standard mode and WebXR, the rig's position represents the user's location in the room.
    const cameraRig = new THREE.Group();
    cameraRig.position.copy(CANDIDATE_SEAT_POS);
    scene.add(cameraRig);
    cameraRigRef.current = cameraRig;

    const camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, 0); // Position is handled by cameraRig
    cameraRig.add(camera);

    // 3. Renderer with WebXR & Soft Shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.xr.enabled = true;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Populate Room Geometry
    const roomShell = buildRoomShell();
    scene.add(roomShell);

    const windowSystem = buildWindowAndSkyline();
    scene.add(windowSystem);

    const door = buildDoor();
    scene.add(door);

    const desk = buildInterviewerDesk();
    scene.add(desk);

    const tableAccessories = buildTableAccessories();
    scene.add(tableAccessories);

    const interviewerChair = buildInterviewerChair();
    scene.add(interviewerChair);

    const candidateChair = buildCandidateChair();
    scene.add(candidateChair);

    // 5. Build & Mount Realistic Human Avatar Controller
    const avatarController = new AvatarController();
    scene.add(avatarController.root);
    avatarControllerRef.current = avatarController;
    setModelSource(avatarController.modelSource);
    setIsGlbLoaded(avatarController.isGlbLoaded);

    const plants = buildPlants();
    scene.add(plants);

    const wallDecorations = buildWallDecorations();
    scene.add(wallDecorations);

    const sideFurniture = buildSideFurniture();
    scene.add(sideFurniture);

    const lights = buildLighting();
    scene.add(lights.group);
    lightsRef.current = {
      deskSpot: lights.deskSpot,
      windowLight: lights.windowLight,
      ambientLight: lights.ambientLight,
    };

    // 6. Controls setup
    const controls = new FirstPersonControls(camera, cameraRig, renderer.domElement);
    controlsRef.current = controls;

    // 7. WebXR Controller Visuals & Interaction
    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);

    // Ray pointers for VR controllers
    const buildControllerRay = () => {
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -2.5),
      ]);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
      });
      return new THREE.Line(rayGeo, rayMat);
    };

    controller1.add(buildControllerRay());
    controller2.add(buildControllerRay());
    cameraRig.add(controller1);
    cameraRig.add(controller2);

    // WebXR Grip (Controller handle models)
    const buildGripMesh = () => {
      const grip = new THREE.Group();
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.02, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      );
      handle.rotation.x = Math.PI / 4;
      grip.add(handle);
      return grip;
    };

    const controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(buildGripMesh());
    cameraRig.add(controllerGrip1);

    const controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(buildGripMesh());
    cameraRig.add(controllerGrip2);

    // 8. Animation Loop
    const clock = new THREE.Clock();

    renderer.setAnimationLoop(() => {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Update Desktop/Mobile FirstPerson Controls when not in VR
      if (!renderer.xr.isPresenting) {
        controls.update(delta);
      } else {
        // In WebXR: poll controller thumbsticks for smooth VR locomotion
        const session = renderer.xr.getSession();
        if (session) {
          for (const source of session.inputSources) {
            if (source.gamepad && source.gamepad.axes.length >= 4) {
              const [,, axisX, axisY] = source.gamepad.axes;
              if (Math.abs(axisX) > 0.15 || Math.abs(axisY) > 0.15) {
                // VR Locomotion along camera gaze
                const head = renderer.xr.getCamera();
                const forward = new THREE.Vector3();
                head.getWorldDirection(forward);
                forward.y = 0;
                forward.normalize();

                const right = new THREE.Vector3();
                right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

                const speed = 1.8 * delta;
                cameraRig.position.addScaledVector(forward, -axisY * speed);
                cameraRig.position.addScaledVector(right, axisX * speed);

                // Room bounds clamp in VR
                cameraRig.position.x = Math.max(-2.6, Math.min(2.6, cameraRig.position.x));
                cameraRig.position.z = Math.max(-2.9, Math.min(2.9, cameraRig.position.z));
              }
            }
          }
        }
      }

      // Update Realistic Human Interviewer Avatar
      if (avatarControllerRef.current) {
        avatarControllerRef.current.update(delta);
      }

      renderer.render(scene, camera);
    });

    // 9. Handle Window Resizing
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      controls.destroy();
      if (audioRef.current.isPlaying) {
        audioRef.current.stop();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle Day/Evening Light Ambience changes
  useEffect(() => {
    if (!lightsRef.current) return;
    const { deskSpot, windowLight, ambientLight } = lightsRef.current;

    if (timeOfDay === 'day') {
      ambientLight.color.setHex(0xf1f5f9);
      ambientLight.intensity = 0.65;
      windowLight.color.setHex(0xfff7ed);
      windowLight.intensity = 1.4;
      deskSpot.color.setHex(0xffedd5);
      deskSpot.intensity = 1.2;
    } else {
      // Evening / Sunset Ambiance
      ambientLight.color.setHex(0x1e293b);
      ambientLight.intensity = 0.4;
      windowLight.color.setHex(0xf97316); // Golden orange sunset
      windowLight.intensity = 0.8;
      deskSpot.color.setHex(0xfde68a); // Warm desk glow
      deskSpot.intensity = 1.8;
    }
  }, [timeOfDay]);

  // Enter WebXR function
  const handleEnterVR = useCallback(async () => {
    const renderer = rendererRef.current;
    if (!renderer || !navigator.xr) return;

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });

      xrSessionRef.current = session;
      setInVr(true);

      session.addEventListener('end', () => {
        xrSessionRef.current = null;
        setInVr(false);
      });

      await renderer.xr.setSession(session);
    } catch (err) {
      console.error('Failed to start VR session:', err);
      alert('Could not start WebXR session. Please ensure your VR headset is connected.');
    }
  }, []);

  // Exit WebXR function
  const handleExitVR = useCallback(async () => {
    if (xrSessionRef.current) {
      await xrSessionRef.current.end();
      xrSessionRef.current = null;
      setInVr(false);
    }
  }, []);

  // Set camera view preset
  const handleSetPreset = useCallback((presetId: string) => {
    const preset = CAMERA_PRESETS.find((p) => p.id === presetId);
    if (preset && controlsRef.current) {
      controlsRef.current.setViewPreset(preset);
      setActivePreset(presetId);
    }
  }, []);

  // Audio ambiance toggle
  const handleToggleAudio = useCallback(() => {
    const newState = audioRef.current.toggle();
    setAudioActive(newState);
  }, []);

  // Avatar handlers
  const handleSetAvatarState = useCallback((newState: AvatarState) => {
    setAvatarState(newState);
    if (avatarControllerRef.current) {
      avatarControllerRef.current.setState(newState);
    }
  }, []);

  const handleUpdateAvatarConfig = useCallback((newConfig: Partial<AvatarConfig>) => {
    setAvatarConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      if (avatarControllerRef.current) {
        avatarControllerRef.current.setConfig(merged);
      }
      return merged;
    });
  }, []);

  const handleReloadGlb = useCallback(() => {
    if (avatarControllerRef.current) {
      avatarControllerRef.current.tryLoadGlbModel();
      setTimeout(() => {
        if (avatarControllerRef.current) {
          setModelSource(avatarControllerRef.current.modelSource);
          setIsGlbLoaded(avatarControllerRef.current.isGlbLoaded);
        }
      }, 500);
    }
  }, []);

  // Mobile movement callbacks
  const handleMobileMove = useCallback((direction: 'forward' | 'backward' | 'left' | 'right', active: boolean) => {
    if (!controlsRef.current) return;
    if (direction === 'forward') controlsRef.current.moveForward = active;
    if (direction === 'backward') controlsRef.current.moveBackward = active;
    if (direction === 'left') controlsRef.current.moveLeft = active;
    if (direction === 'right') controlsRef.current.moveRight = active;
  }, []);

  const handleMobileLook = useCallback((deltaX: number, deltaY: number) => {
    if (!controlsRef.current) return;
    controlsRef.current.yaw -= deltaX * 0.005;
    controlsRef.current.pitch -= deltaY * 0.005;
    const maxPitch = Math.PI / 2 - 0.08;
    controlsRef.current.pitch = Math.max(-maxPitch, Math.min(maxPitch, controlsRef.current.pitch));
    controlsRef.current.updateCameraRotation();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Crosshair indicator in center of view */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-white/40 ring-4 ring-white/10" />
      </div>

      {/* Top and Bottom UI Overlay */}
      <HUDOverlay
        vrSupported={vrSupported}
        inVr={inVr}
        activePreset={activePreset}
        timeOfDay={timeOfDay}
        audioActive={audioActive}
        avatarState={avatarState}
        showAvatarSettings={showAvatarSettings}
        onEnterVR={handleEnterVR}
        onExitVR={handleExitVR}
        onSelectPreset={handleSetPreset}
        onToggleTimeOfDay={() => setTimeOfDay((prev) => (prev === 'day' ? 'evening' : 'day'))}
        onToggleAudio={handleToggleAudio}
        onToggleAvatarSettings={() => setShowAvatarSettings((prev) => !prev)}
        onOpenHelp={() => setShowHelp(true)}
      />

      {/* Avatar Developer Configuration Panel */}
      {showAvatarSettings && (
        <AvatarDevSettings
          config={avatarConfig}
          currentState={avatarState}
          modelSource={modelSource}
          isGlbLoaded={isGlbLoaded}
          onUpdateConfig={handleUpdateAvatarConfig}
          onSetState={handleSetAvatarState}
          onReloadGlb={handleReloadGlb}
          onClose={() => setShowAvatarSettings(false)}
        />
      )}

      {/* Mobile Touch Navigation Controls (Visible on touch/mobile screens) */}
      {isMobile && (
        <MobileControls
          onMove={handleMobileMove}
          onLook={handleMobileLook}
          onResetSeat={() => handleSetPreset('candidate')}
        />
      )}

      {/* College Project Guide & WebXR Documentation Modal */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

