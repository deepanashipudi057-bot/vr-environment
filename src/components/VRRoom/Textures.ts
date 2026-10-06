import * as THREE from 'three';

/**
 * Procedural high-resolution canvas textures for Career Sprint Interview Room
 * Eliminates external texture asset dependencies and guarantees instantaneous loading.
 */

export function createParquetFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm executive wood floor base
  ctx.fillStyle = '#6d4c3d';
  ctx.fillRect(0, 0, 1024, 1024);

  const plankHeight = 64;
  const plankWidth = 256;

  for (let y = 0; y < 1024; y += plankHeight) {
    const offsetX = (Math.floor(y / plankHeight) % 2) * 128;
    for (let x = -128 + offsetX; x < 1024; x += plankWidth) {
      // Wood plank tone variation
      const toneVariance = Math.floor((Math.random() - 0.5) * 26);
      const r = Math.min(255, Math.max(0, 115 + toneVariance));
      const g = Math.min(255, Math.max(0, 82 + toneVariance));
      const b = Math.min(255, Math.max(0, 62 + toneVariance));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x + 1, y + 1, plankWidth - 2, plankHeight - 2);

      // Fine wood grain lines
      ctx.strokeStyle = `rgba(0, 0, 0, 0.08)`;
      ctx.lineWidth = 1;
      for (let gIdx = 0; gIdx < 6; gIdx++) {
        const lineY = y + 8 + gIdx * 9;
        ctx.beginPath();
        ctx.moveTo(x, lineY);
        ctx.bezierCurveTo(
          x + plankWidth * 0.3,
          lineY + (Math.random() * 4 - 2),
          x + plankWidth * 0.7,
          lineY + (Math.random() * 4 - 2),
          x + plankWidth,
          lineY
        );
        ctx.stroke();
      }

      // Plank bevel edge
      ctx.strokeStyle = 'rgba(30, 20, 15, 0.4)';
      ctx.strokeRect(x, y, plankWidth, plankHeight);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createCarpetTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#2b313d';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle woven tile pattern
  for (let x = 0; x < 512; x += 8) {
    for (let y = 0; y < 512; y += 8) {
      const shade = Math.floor(Math.random() * 20);
      ctx.fillStyle = `rgba(255, 255, 255, ${shade * 0.005})`;
      ctx.fillRect(x, y, 7, 7);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createCeilingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f4f5f7';
  ctx.fillRect(0, 0, 512, 512);

  // Acoustic ceiling grid
  ctx.strokeStyle = '#d5d8de';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.strokeRect(0, 0, 256, 256);
  ctx.strokeRect(256, 0, 256, 256);
  ctx.strokeRect(0, 256, 256, 256);
  ctx.strokeRect(256, 256, 256, 256);

  // Micro acoustic dots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createWoodSlatsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark acoustic backing
  ctx.fillStyle = '#181a1f';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical architectural oak slats
  const slatWidth = 24;
  const gap = 8;
  for (let x = 0; x < 512; x += slatWidth + gap) {
    const grad = ctx.createLinearGradient(x, 0, x + slatWidth, 0);
    grad.addColorStop(0, '#7c5539');
    grad.addColorStop(0.5, '#a6724a');
    grad.addColorStop(1, '#66452e');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, slatWidth, 512);

    // Subtle edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(x, 0, 2, 512);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

export function createLaptopScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Dark corporate dashboard theme
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 640);

  // Top header bar
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 1024, 52);

  // Window control dots (Mac-style)
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(24, 26, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(44, 26, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(64, 26, 6, 0, Math.PI * 2);
  ctx.fill();

  // App Title
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('CAREER SPRINT', 100, 33);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px "Segoe UI", sans-serif';
  ctx.fillText('// Interview Evaluation Console', 280, 32);

  // Candidate Card
  ctx.fillStyle = '#1e293b';
  ctx.roundRect?.(30, 80, 460, 240, 12);
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('Candidate: Alex Rivera', 50, 120);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('Role: Senior Software Engineer (Full Stack)', 50, 148);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText('Session: Technical Round 1 (Live Coding & Architecture)', 50, 175);
  ctx.fillText('Time Elapsed: 00:32:15', 50, 198);

  // Rating progress bars
  const skills = [
    { name: 'System Design', score: 90, color: '#38bdf8' },
    { name: 'Data Structures & Algorithms', score: 85, color: '#34d399' },
    { name: 'Problem Solving', score: 95, color: '#a78bfa' },
  ];

  skills.forEach((skill, idx) => {
    const y = 230 + idx * 26;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.fillText(skill.name, 50, y);

    // Bar background
    ctx.fillStyle = '#334155';
    ctx.fillRect(230, y - 10, 220, 10);
    // Bar fill
    ctx.fillStyle = skill.color;
    ctx.fillRect(230, y - 10, (220 * skill.score) / 100, 10);
  });

  // Code / Notes panel (right side)
  ctx.fillStyle = '#1e293b';
  ctx.roundRect?.(520, 80, 474, 520, 12);
  ctx.fill();

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText('Interviewer Live Rubric & Notes', 545, 120);

  const notes = [
    '• Strong grasp of distributed systems & consensus protocols.',
    '• Handled edge cases effectively during design question.',
    '• Clean communication and confident presence.',
    '• Question 3: Optimized latency from O(N^2) to O(N log N).',
    '• Recommended for Next Round: YES [Strong Hire]',
  ];

  ctx.font = '15px "Segoe UI", sans-serif';
  ctx.fillStyle = '#cbd5e1';
  notes.forEach((note, i) => {
    ctx.fillText(note, 545, 165 + i * 40);
  });

  // Bottom Status
  ctx.fillStyle = '#059669';
  ctx.fillRect(30, 345, 460, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('STATUS: LIVE INTERVIEW IN PROGRESS', 70, 373);

  // Green recording light
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(52, 368, 6, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

export function createWhiteboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  // Clean magnetic whiteboard surface
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 640);

  // Subtle grid
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }
  for (let y = 0; y < 640; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Header in marker blue
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 32px "Segoe UI", sans-serif';
  ctx.fillText('CAREER SPRINT // INTERVIEW ROOM 4', 40, 60);

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(40, 75);
  ctx.lineTo(550, 75);
  ctx.stroke();

  // Architecture Diagram
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('System Architecture Workflow:', 40, 130);

  // Diagram boxes (Simulating live interview whiteboard drawing)
  const drawBox = (x: number, y: number, w: number, h: number, text: string, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
    ctx.strokeRect(x, y, w, h);
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = color;
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + 6);
    ctx.textAlign = 'left';
  };

  drawBox(50, 160, 140, 60, 'Client App', '#2563eb');
  drawBox(270, 160, 160, 60, 'API Gateway', '#059669');
  drawBox(510, 160, 170, 60, 'Services Cluster', '#d97706');
  drawBox(760, 160, 160, 60, 'Database Pool', '#7c3aed');

  // Arrows
  const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - 10, toY - 6);
    ctx.lineTo(toX - 10, toY + 6);
    ctx.closePath();
    ctx.fillStyle = '#475569';
    ctx.fill();
  };

  drawArrow(190, 190, 270, 190);
  drawArrow(430, 190, 510, 190);
  drawArrow(680, 190, 760, 190);

  // Agenda list (Marker handwritten style)
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('Agenda & Timeline:', 50, 290);

  const agenda = [
    '00 - 05m : Introductions & Background',
    '05 - 25m : High-Scale System Design Case',
    '25 - 45m : Technical Deep Dive & Coding',
    '45 - 55m : Candidate Q&A & Culture Alignment',
  ];

  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillStyle = '#1e293b';
  agenda.forEach((item, idx) => {
    // Checkbox
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 320 + idx * 36, 18, 18);
    if (idx < 2) {
      // Checked mark
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(54, 330 + idx * 36);
      ctx.lineTo(58, 335 + idx * 36);
      ctx.lineTo(65, 324 + idx * 36);
      ctx.stroke();
    }
    ctx.fillStyle = '#1e293b';
    ctx.fillText(item, 85, 335 + idx * 36);
  });

  // Marker eraser marks at bottom
  ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
  ctx.fillRect(40, 560, 160, 20);

  return new THREE.CanvasTexture(canvas);
}

export function createNotepadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#fefae0';
  ctx.fillRect(0, 0, 512, 512);

  // Top header margin
  ctx.fillStyle = '#e29578';
  ctx.fillRect(0, 0, 512, 40);

  // Lined paper lines
  ctx.strokeStyle = '#c5d3e8';
  ctx.lineWidth = 1.5;
  for (let y = 60; y < 512; y += 28) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Red margin line
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.lineTo(60, 512);
  ctx.stroke();

  // Notes text
  ctx.fillStyle = '#1e3a8a';
  ctx.font = 'italic 16px "Segoe UI", cursive';
  ctx.fillText('Sprint Round 1 - Notes', 80, 85);
  ctx.fillText('- Communication: Confident', 80, 113);
  ctx.fillText('- Clean code structuring', 80, 141);
  ctx.fillText('- Asked insightful questions', 80, 169);
  ctx.fillText('- Fast time complexity!', 80, 197);

  return new THREE.CanvasTexture(canvas);
}

export function createNameplateTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Brushed brass / gold gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 128);
  grad.addColorStop(0, '#c79c5e');
  grad.addColorStop(0.5, '#f4d58d');
  grad.addColorStop(1, '#a67c42');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#5a3d1c';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 120);

  // Name
  ctx.fillStyle = '#1c1917';
  ctx.font = 'bold 36px "Segoe UI", serif';
  ctx.textAlign = 'center';
  ctx.fillText('DR. EVAN VANCE', 256, 56);

  // Title
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.fillText('HEAD OF ENGINEERING // CAREER SPRINT', 256, 92);

  return new THREE.CanvasTexture(canvas);
}

export function createDoorSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 240);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 38px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ROOM 402', 256, 80);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('CAREER SPRINT SUITE', 256, 125);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillText('EXECUTIVE INTERVIEW ROOM', 256, 165);

  // In Use Status light indicator
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(256, 210, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fca5a5';
  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.fillText('IN SESSION', 256, 235);

  return new THREE.CanvasTexture(canvas);
}
