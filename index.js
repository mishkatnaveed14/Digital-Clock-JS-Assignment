// Ambient Particles Canvas System
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = Array.from({ length: 45 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  radius: Math.random() * 1.8 + 0.5,
  dx: (Math.random() - 0.5) * 0.4,
  dy: (Math.random() - 0.5) * 0.4,
  alpha: Math.random() * 0.5 + 0.2
}));

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 242, 254, ${p.alpha})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f2fe';
    ctx.fill();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Main Clock & App Logic
let currentMode = 'clock';
let is24Hour = false;

// Stopwatch State
let swInterval = null;
let swTime = 0;
let swRunning = false;

// Timer State
let tmrInterval = null;
let tmrTotalSecs = 0;
let tmrRemSecs = 0;
let tmrRunning = false;

// Selectors
const dateText = document.getElementById('dateText');
const formatToggle = document.getElementById('formatToggle');
const formatText = document.getElementById('formatText');

const clockHours = document.getElementById('clockHours');
const clockMins = document.getElementById('clockMins');
const clockSecs = document.getElementById('clockSecs');
const clockAmpm = document.getElementById('clockAmpm');

const swMins = document.getElementById('swMins');
const swSecs = document.getElementById('swSecs');
const swMs = document.getElementById('swMs');

const inputMins = document.getElementById('inputMins');
const inputSecs = document.getElementById('inputSecs');
const tmrMins = document.getElementById('tmrMins');
const tmrSecs = document.getElementById('tmrSecs');
const timerInputs = document.getElementById('timerInputs');
const timerDisplay = document.getElementById('timerDisplay');

const progressRing = document.getElementById('progressRing');
const controlsArea = document.getElementById('controlsArea');
const CIRCUMFERENCE = 289;

// Mode Switching Engine
document.querySelectorAll('.mode-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view-screen').forEach(v => v.classList.remove('active'));

    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    
    const targetView = currentMode === 'clock' ? 'clockView' : currentMode === 'stopwatch' ? 'swView' : 'timerView';
    document.getElementById(targetView).classList.add('active');

    renderControls();
    updateProgressRing();
  });
});

// Live Clock Renderer
function updateClock() {
  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: '2-digit' };
  dateText.textContent = now.toLocaleDateString('en-US', options).toUpperCase();

  let hrs = now.getHours();
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  let ampm = hrs >= 12 ? 'PM' : 'AM';

  if (!is24Hour) {
    hrs = hrs % 12 || 12;
    clockAmpm.style.display = 'inline';
  } else {
    clockAmpm.style.display = 'none';
  }

  clockHours.textContent = String(hrs).padStart(2, '0');
  clockMins.textContent = mins;
  clockSecs.textContent = secs;
  clockAmpm.textContent = ampm;

  if (currentMode === 'clock') {
    const secProgress = now.getSeconds() / 60;
    progressRing.style.strokeDashoffset = CIRCUMFERENCE - (secProgress * CIRCUMFERENCE);
  }
}

// Format Toggle Event
formatToggle.addEventListener('click', () => {
  is24Hour = !is24Hour;
  formatText.textContent = is24Hour ? '24H' : '12H';
  updateClock();
});

// Stopwatch Logic
function toggleStopwatch() {
  if (!swRunning) {
    swRunning = true;
    const start = Date.now() - swTime;
    swInterval = setInterval(() => {
      swTime = Date.now() - start;
      const m = Math.floor(swTime / 60000);
      const s = Math.floor((swTime % 60000) / 1000);
      const ms = Math.floor((swTime % 1000) / 10);

      swMins.textContent = String(m).padStart(2, '0');
      swSecs.textContent = String(s).padStart(2, '0');
      swMs.textContent = '.' + String(ms).padStart(2, '0');

      if (currentMode === 'stopwatch') {
        const progress = (s % 60) / 60;
        progressRing.style.strokeDashoffset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
      }
    }, 10);
  } else {
    swRunning = false;
    clearInterval(swInterval);
  }
  renderControls();
}

function resetStopwatch() {
  swRunning = false;
  clearInterval(swInterval);
  swTime = 0;
  swMins.textContent = '00';
  swSecs.textContent = '00';
  swMs.textContent = '.00';
  progressRing.style.strokeDashoffset = CIRCUMFERENCE;
  renderControls();
}

// Timer Logic
function toggleTimer() {
  if (!tmrRunning) {
    if (tmrRemSecs === 0) {
      const m = parseInt(inputMins.value) || 0;
      const s = parseInt(inputSecs.value) || 0;
      tmrTotalSecs = m * 60 + s;
      tmrRemSecs = tmrTotalSecs;
    }

    if (tmrTotalSecs <= 0) return;

    tmrRunning = true;
    timerInputs.classList.add('hidden');
    timerDisplay.classList.remove('hidden');

    tmrInterval = setInterval(() => {
      tmrRemSecs--;
      const m = Math.floor(tmrRemSecs / 60);
      const s = tmrRemSecs % 60;

      tmrMins.textContent = String(m).padStart(2, '0');
      tmrSecs.textContent = String(s).padStart(2, '0');

      if (currentMode === 'timer') {
        const progress = tmrRemSecs / tmrTotalSecs;
        progressRing.style.strokeDashoffset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
      }

      if (tmrRemSecs <= 0) {
        clearInterval(tmrInterval);
        resetTimer();
      }
    }, 1000);
  } else {
    tmrRunning = false;
    clearInterval(tmrInterval);
  }
  renderControls();
}

function resetTimer() {
  tmrRunning = false;
  clearInterval(tmrInterval);
  tmrTotalSecs = 0;
  tmrRemSecs = 0;
  timerInputs.classList.remove('hidden');
  timerDisplay.classList.add('hidden');
  progressRing.style.strokeDashoffset = CIRCUMFERENCE;
  renderControls();
}

// Dynamic Action Buttons
function renderControls() {
  controlsArea.innerHTML = '';

  if (currentMode === 'clock') {
    controlsArea.innerHTML = `<span style="font-size: 0.78rem; font-weight: 600; color: #64748b; align-self: center; display: flex; align-items: center; gap: 6px;"><i class="fa-solid fa-satellite-dish" style="color: var(--cyan-neon);"></i> SYNCHRONIZED REALTIME</span>`;
  } else if (currentMode === 'stopwatch') {
    controlsArea.innerHTML = `
      <button class="ctrl-btn primary" onclick="toggleStopwatch()">
        <i class="fa-solid fa-${swRunning ? 'pause' : 'play'}"></i> ${swRunning ? 'PAUSE' : 'START'}
      </button>
      <button class="ctrl-btn danger" onclick="resetStopwatch()">
        <i class="fa-solid fa-rotate-right"></i> RESET
      </button>
    `;
  } else if (currentMode === 'timer') {
    controlsArea.innerHTML = `
      <button class="ctrl-btn primary" onclick="toggleTimer()">
        <i class="fa-solid fa-${tmrRunning ? 'pause' : 'play'}"></i> ${tmrRunning ? 'PAUSE' : 'START'}
      </button>
      <button class="ctrl-btn danger" onclick="resetTimer()">
        <i class="fa-solid fa-rotate-right"></i> RESET
      </button>
    `;
  }
}

function updateProgressRing() {
  if (currentMode === 'clock') {
    const sec = new Date().getSeconds();
    progressRing.style.strokeDashoffset = CIRCUMFERENCE - ((sec / 60) * CIRCUMFERENCE);
  } else if (currentMode === 'stopwatch') {
    const s = Math.floor((swTime % 60000) / 1000);
    progressRing.style.strokeDashoffset = CIRCUMFERENCE - ((s / 60) * CIRCUMFERENCE);
  } else if (currentMode === 'timer') {
    const progress = tmrTotalSecs > 0 ? tmrRemSecs / tmrTotalSecs : 1;
    progressRing.style.strokeDashoffset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
  }
}

// Init
setInterval(updateClock, 1000);
updateClock();
renderControls();