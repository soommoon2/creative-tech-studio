/* ═══════════════════════════════════════════════
   CREATIVE TECH STUDIO — Protected Video Player
   Download DISABLED. Right-click DISABLED.
   ═══════════════════════════════════════════════ */

const video    = document.getElementById('mainVideo');
const wrapper  = document.getElementById('videoWrapper');
const shield   = document.getElementById('videoShield');
const playIcon = document.getElementById('playIcon');
const centerIcon = document.getElementById('centerIcon');
const progressFill   = document.getElementById('progressFill');
const progressBuffered = document.getElementById('progressBuffered');
const progressThumb  = document.getElementById('progressThumb');
const progressBar    = document.getElementById('progressBar');
const currentTimeEl  = document.getElementById('currentTime');
const totalTimeEl    = document.getElementById('totalTime');
const speedBtn       = document.getElementById('speedBtn');
const volumeSlider   = document.getElementById('volumeSlider');

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
let speedIndex = 2; // default 1x
let isDragging = false;

if (!video) { console.warn('No video element found'); }

// ─────────────────────────────────────────────
// 🔒 DOWNLOAD PREVENTION
// ─────────────────────────────────────────────

// 1. Block right-click on entire page
document.addEventListener('contextmenu', e => { e.preventDefault(); return false; });

// 2. Block keyboard save shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'u' || e.key === 'c')) {
    e.preventDefault(); return false;
  }
  // F12 developer tools — just block (won't fully prevent but discourages)
  if (e.key === 'F12') { e.preventDefault(); return false; }

  // Player keyboard shortcuts
  if (!video) return;
  if (e.key === ' ' || e.key === 'k') { e.preventDefault(); togglePlay(); }
  if (e.key === 'ArrowRight' || e.key === 'l') skipTime(10);
  if (e.key === 'ArrowLeft'  || e.key === 'j') skipTime(-10);
  if (e.key === 'ArrowUp')   { video.volume = Math.min(1, video.volume + 0.1); updateVolumeSlider(); }
  if (e.key === 'ArrowDown') { video.volume = Math.max(0, video.volume - 0.1); updateVolumeSlider(); }
  if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  if (e.key === 'm' || e.key === 'M') toggleMute();
});

// 3. Shield layer blocks pointer events on the video itself
// (video clicks go through shield to our JS)
if (shield) {
  shield.addEventListener('click', togglePlay);
  shield.addEventListener('dblclick', toggleFullscreen);
}

// 4. Disable drag of video element
if (video) {
  video.addEventListener('dragstart', e => e.preventDefault());
  video.setAttribute('controlsList', 'nodownload noremoteplayback nofullscreen');
  video.setAttribute('disablePictureInPicture', '');
  video.disablePictureInPicture = true;
}

// 5. DevTools detection (basic)
let devtoolsOpen = false;
const threshold = 160;
setInterval(() => {
  if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
    if (!devtoolsOpen) {
      devtoolsOpen = true;
      if (video) { video.pause(); video.src = ''; }
      showToast('Developer tools detect bhayo. Video paused.', 'error');
    }
  } else { devtoolsOpen = false; }
}, 1000);

// ─────────────────────────────────────────────
// ▶ PLAYER CONTROLS
// ─────────────────────────────────────────────

function togglePlay() {
  if (!video) return;
  if (video.paused) {
    video.play();
    wrapper.classList.remove('paused');
    setPlayIcon(false);
  } else {
    video.pause();
    wrapper.classList.add('paused');
    setPlayIcon(true);
  }
}
window.togglePlay = togglePlay;

function setPlayIcon(isPaused) {
  const poly = isPaused
    ? '<polygon points="5 3 19 12 5 21 5 3"/>'
    : '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  if (playIcon) playIcon.innerHTML = poly;
  if (centerIcon) centerIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
}

function skipTime(secs) {
  if (!video) return;
  video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + secs));
}
window.skipTime = skipTime;

function toggleMute() {
  if (!video) return;
  video.muted = !video.muted;
  updateVolumeSlider();
}
window.toggleMute = toggleMute;

function setVolume(val) {
  if (!video) return;
  video.volume = parseFloat(val);
  video.muted = (val == 0);
}
window.setVolume = setVolume;

function updateVolumeSlider() {
  if (!volumeSlider || !video) return;
  volumeSlider.value = video.muted ? 0 : video.volume;
}

function cycleSpeed() {
  if (!video) return;
  speedIndex = (speedIndex + 1) % speeds.length;
  video.playbackRate = speeds[speedIndex];
  if (speedBtn) speedBtn.textContent = speeds[speedIndex] + 'x';
}
window.cycleSpeed = cycleSpeed;

function toggleFullscreen() {
  if (!wrapper) return;
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen?.() || wrapper.webkitRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() || document.webkitExitFullscreen?.();
  }
}
window.toggleFullscreen = toggleFullscreen;

// ── Time Formatting ───────────────────────────
function formatTime(secs) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Video Event Listeners ─────────────────────
if (video) {
  video.addEventListener('timeupdate', () => {
    if (!video.duration || isDragging) return;
    const pct = (video.currentTime / video.duration) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressThumb) progressThumb.style.left = `calc(${pct}% - 7px)`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(video.currentTime);
  });

  video.addEventListener('loadedmetadata', () => {
    if (totalTimeEl) totalTimeEl.textContent = formatTime(video.duration);
  });

  video.addEventListener('progress', () => {
    if (!video.duration) return;
    try {
      const buf = video.buffered;
      if (buf.length > 0) {
        const pct = (buf.end(buf.length - 1) / video.duration) * 100;
        if (progressBuffered) progressBuffered.style.width = pct + '%';
      }
    } catch(e) {}
  });

  video.addEventListener('ended', () => {
    wrapper.classList.add('paused');
    setPlayIcon(true);
    showToast('Video complete! Next lesson ready. 🎉', 'success');
  });

  video.addEventListener('waiting', () => { /* buffering indicator here if needed */ });
  video.addEventListener('play',  () => { wrapper.classList.remove('paused'); setPlayIcon(false); });
  video.addEventListener('pause', () => { wrapper.classList.add('paused');    setPlayIcon(true);  });
}

// ── Progress Bar Seek ─────────────────────────
if (progressBar && video) {
  const seek = (e) => {
    const rect = progressBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = x / rect.width;
    video.currentTime = pct * (video.duration || 0);
    if (progressFill) progressFill.style.width = (pct * 100) + '%';
    if (progressThumb) progressThumb.style.left = `calc(${pct * 100}% - 7px)`;
  };
  progressBar.addEventListener('mousedown', e => { isDragging = true; seek(e); });
  document.addEventListener('mousemove', e => { if (isDragging) seek(e); });
  document.addEventListener('mouseup', () => { isDragging = false; });
  progressBar.addEventListener('click', seek);

  // Touch support
  progressBar.addEventListener('touchstart', e => { isDragging = true; seek(e.touches[0]); }, { passive: true });
  document.addEventListener('touchmove', e => { if (isDragging) seek(e.touches[0]); }, { passive: true });
  document.addEventListener('touchend', () => { isDragging = false; });
}

// ── Playlist Navigation ───────────────────────
let currentVideoIndex = 3;
const videoTitles = [
  '01 — Interface ra Workspace Chinna',
  '02 — Selection Tools Master Garne',
  '03 — Layers ra Blending Modes',
  '04 — Basic Retouching Techniques',
  '05 — Color Correction — Curves ra Levels',
  '06 — Text ra Typography Basics',
  '07 — Export — JPEG, PNG, PSD',
  '08 — Masking — Layer, Clipping, Vector',
  '09 — Smart Objects',
  '10 — Background Removal — Pen Tool',
];

function loadVideo(index, title) {
  currentVideoIndex = index;
  const titleEl = document.getElementById('videoTitle');
  if (titleEl) titleEl.textContent = title;
  document.querySelectorAll('.playlist-item').forEach((item, i) => {
    item.classList.remove('active');
    if (i === index) item.classList.add('active');
  });
  if (video) { video.currentTime = 0; video.play(); }
  showToast('Loading: ' + title, 'success');
}
window.loadVideo = loadVideo;

function nextVideo() {
  const next = currentVideoIndex + 1;
  if (next < videoTitles.length) loadVideo(next, videoTitles[next]);
  else showToast('Yo module ko sabai video complete bhayo! 🎉', 'success');
}
window.nextVideo = nextVideo;

function prevVideo() {
  const prev = currentVideoIndex - 1;
  if (prev >= 0) loadVideo(prev, videoTitles[prev]);
  else showToast('Yo nai pahilo video ho!', 'error');
}
window.prevVideo = prevVideo;

// ── Auth Guard ────────────────────────────────
const currentUser = JSON.parse(localStorage.getItem('cts_currentUser') || 'null');
if (!currentUser) window.location.href = 'login.html';

// Update watermark with user email
const wm = document.getElementById('videoWatermark');
if (wm && currentUser) wm.textContent = `CTS • ${currentUser.email || 'Protected'}`;

// ── Toast ─────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => setTimeout(() => toast.classList.add('show'), 10));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
}
window.showToast = showToast;
