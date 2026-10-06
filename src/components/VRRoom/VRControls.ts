import * as THREE from 'three';
import { ROOM_WIDTH, ROOM_DEPTH, CANDIDATE_SEAT_POS } from './RoomObjects.ts';

export interface ViewPreset {
  id: string;
  name: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
}

export const CAMERA_PRESETS: ViewPreset[] = [
  {
    id: 'candidate',
    name: 'Candidate Chair (Default)',
    position: new THREE.Vector3(0, 1.25, 1.2),
    target: new THREE.Vector3(0, 1.15, -0.55),
  },
  {
    id: 'standing',
    name: 'Standing Center',
    position: new THREE.Vector3(0, 1.65, 0.5),
    target: new THREE.Vector3(0, 1.2, -0.6),
  },
  {
    id: 'desk_close',
    name: 'Desk Inspection',
    position: new THREE.Vector3(-0.15, 1.1, 0.1),
    target: new THREE.Vector3(-0.15, 0.78, -0.45),
  },
  {
    id: 'interviewer',
    name: 'Interviewer View',
    position: new THREE.Vector3(0, 1.3, -1.3),
    target: new THREE.Vector3(0, 1.1, 0.8),
  },
  {
    id: 'whiteboard',
    name: 'Whiteboard View',
    position: new THREE.Vector3(-1.4, 1.5, 0.8),
    target: new THREE.Vector3(-ROOM_WIDTH / 2, 1.6, 0.8),
  },
  {
    id: 'window',
    name: 'City Skyline View',
    position: new THREE.Vector3(1.8, 1.5, 0),
    target: new THREE.Vector3(ROOM_WIDTH / 2 + 3, 1.5, 0),
  },
];

export class FirstPersonControls {
  public camera: THREE.PerspectiveCamera;
  public cameraRig: THREE.Group;
  public domElement: HTMLElement;

  private isPointerDown: boolean = false;
  private prevPointerX: number = 0;
  private prevPointerY: number = 0;

  public yaw: number = 0;
  public pitch: number = 0;

  // Active key states
  public moveForward: boolean = false;
  public moveBackward: boolean = false;
  public moveLeft: boolean = false;
  public moveRight: boolean = false;

  private moveSpeed: number = 2.4; // meters per second
  private isPointerLocked: boolean = false;

  // Camera animation lerp
  private targetPosition: THREE.Vector3 | null = null;
  private isTransitioning: boolean = false;

  constructor(camera: THREE.PerspectiveCamera, cameraRig: THREE.Group, domElement: HTMLElement) {
    this.camera = camera;
    this.cameraRig = cameraRig;
    this.domElement = domElement;

    // Initialize rotation facing interviewer (towards -Z)
    this.yaw = 0;
    this.pitch = 0;
    this.updateCameraRotation();

    this.bindEvents();
  }

  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);

    // Touch events for mobile
    this.domElement.addEventListener('touchstart', this.onTouchStart, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('touchend', this.onTouchEnd);

    // Pointer lock support
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
  }

  public destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);

    this.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);

    this.domElement.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);

    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        this.isTransitioning = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        this.isTransitioning = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        this.isTransitioning = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        this.isTransitioning = false;
        break;
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    // Only trigger if clicking directly on canvas or inside viewport
    if ((e.target as HTMLElement).tagName.toLowerCase() !== 'canvas') return;
    this.isPointerDown = true;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;
    this.isTransitioning = false;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (this.isPointerLocked) {
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;
      this.yaw -= movementX * 0.0025;
      this.pitch -= movementY * 0.0025;
      this.clampPitch();
      this.updateCameraRotation();
      return;
    }

    if (!this.isPointerDown) return;
    const deltaX = e.clientX - this.prevPointerX;
    const deltaY = e.clientY - this.prevPointerY;
    this.prevPointerX = e.clientX;
    this.prevPointerY = e.clientY;

    this.yaw -= deltaX * 0.0035;
    this.pitch -= deltaY * 0.0035;
    this.clampPitch();
    this.updateCameraRotation();
  };

  private onMouseUp = () => {
    this.isPointerDown = false;
  };

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.isPointerDown = true;
      this.prevPointerX = touch.clientX;
      this.prevPointerY = touch.clientY;
      this.isTransitioning = false;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.isPointerDown || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - this.prevPointerX;
    const deltaY = touch.clientY - this.prevPointerY;
    this.prevPointerX = touch.clientX;
    this.prevPointerY = touch.clientY;

    this.yaw -= deltaX * 0.004;
    this.pitch -= deltaY * 0.004;
    this.clampPitch();
    this.updateCameraRotation();
  };

  private onTouchEnd = () => {
    this.isPointerDown = false;
  };

  private onPointerLockChange = () => {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  };

  public requestPointerLock() {
    this.domElement.requestPointerLock?.();
  }

  public exitPointerLock() {
    document.exitPointerLock?.();
  }

  private clampPitch() {
    // Restrict vertical pitch to prevent flipping upside down (-85 deg to +85 deg)
    const maxPitch = Math.PI / 2 - 0.08;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  public updateCameraRotation() {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;
  }

  public setViewPreset(preset: ViewPreset) {
    this.targetPosition = preset.position.clone();
    this.isTransitioning = true;

    // Calculate yaw and pitch to face the target
    const dir = new THREE.Vector3().subVectors(preset.target, preset.position).normalize();
    this.yaw = Math.atan2(-dir.x, -dir.z);
    this.pitch = Math.asin(dir.y);
    this.clampPitch();
    this.updateCameraRotation();
  }

  public resetToCandidateSeat() {
    const defaultPreset = CAMERA_PRESETS[0];
    this.setViewPreset(defaultPreset);
  }

  public update(delta: number) {
    // Smooth position transition if animating between presets
    if (this.isTransitioning && this.targetPosition) {
      this.cameraRig.position.lerp(this.targetPosition, 6.0 * delta);
      if (this.cameraRig.position.distanceTo(this.targetPosition) < 0.02) {
        this.cameraRig.position.copy(this.targetPosition);
        this.isTransitioning = false;
        this.targetPosition = null;
      }
      return;
    }

    // Process WASD / Touch movements
    let moveX = 0;
    let moveZ = 0;

    if (this.moveForward) moveZ -= 1;
    if (this.moveBackward) moveZ += 1;
    if (this.moveLeft) moveX -= 1;
    if (this.moveRight) moveX += 1;

    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;

      // Project direction based on horizontal camera yaw
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

      const displacement = new THREE.Vector3()
        .addScaledVector(forward, -moveZ * this.moveSpeed * delta)
        .addScaledVector(right, moveX * this.moveSpeed * delta);

      this.cameraRig.position.add(displacement);

      // Clamp camera within room walls with boundary padding
      const boundX = ROOM_WIDTH / 2 - 0.45;
      const boundZ = ROOM_DEPTH / 2 - 0.45;

      this.cameraRig.position.x = Math.max(-boundX, Math.min(boundX, this.cameraRig.position.x));
      this.cameraRig.position.z = Math.max(-boundZ, Math.min(boundZ, this.cameraRig.position.z));
    }
  }
}
