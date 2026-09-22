const timerDisplay = document.getElementById('timer');
const modeText = document.getElementById('modeText');
const studyMinutesInput = document.getElementById('studyMinutes');
const breakMinutesInput = document.getElementById('breakMinutes');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const musicFileInput = document.getElementById('musicFile');
const toggleMusicBtn = document.getElementById('toggleMusicBtn');
const musicPlayer = document.getElementById('musicPlayer');
const progressBar = document.getElementById('progressBar');
const sessionCount = document.getElementById('sessionCount');
const sessionStatus = document.getElementById('sessionStatus');
const timeHint = document.getElementById('timeHint');
const fileName = document.getElementById('fileName');

let totalSeconds = Number(studyMinutesInput.value) * 60;
let remainingSeconds = totalSeconds;
let timerId = null;
let isRunning = false;
let isBreakMode = false;
let completedSessions = 0;

function formatTime(totalSecondsLeft) {
  const minutes = Math.floor(totalSecondsLeft / 60);
  const seconds = totalSecondsLeft % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(remainingSeconds);
  modeText.textContent = isBreakMode ? 'Reset and recharge' : 'Deep work';
  const currentTotal = (isBreakMode ? Number(breakMinutesInput.value) : Number(studyMinutesInput.value)) * 60;
  progressBar.style.width = `${Math.max(0, Math.min(100, ((currentTotal - remainingSeconds) / currentTotal) * 100))}%`;
  document.title = `${formatTime(remainingSeconds)} | Stillpoint`;
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
  sessionStatus.textContent = 'Paused';
}

function finishSession() {
  stopTimer();
  const audio = new Audio();
  audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=';
  audio.play().catch(() => {});

  isBreakMode = !isBreakMode;
  if (!isBreakMode) completedSessions += 1;
  sessionCount.textContent = String(completedSessions + 1).padStart(2, '0');
  const nextMinutes = isBreakMode ? Number(breakMinutesInput.value) : Number(studyMinutesInput.value);
  remainingSeconds = nextMinutes * 60;
  updateDisplay();
  timeHint.textContent = isBreakMode ? 'Nice work. Take a real pause.' : 'Break is over. Ready for another round?';
}

function tick() {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    updateDisplay();
    return;
  }

  finishSession();
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  sessionStatus.textContent = isBreakMode ? 'Break in progress' : 'Focus in progress';
  timeHint.textContent = isBreakMode ? 'Step away for a moment.' : 'You are exactly where you need to be.';
  timerId = setInterval(tick, 1000);
}

function pauseTimer() {
  stopTimer();
}

function resetTimer() {
  stopTimer();
  isBreakMode = false;
  totalSeconds = Number(studyMinutesInput.value) * 60;
  remainingSeconds = totalSeconds;
  sessionStatus.textContent = 'Ready to focus';
  timeHint.textContent = 'Your focus session starts when you are ready.';
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

studyMinutesInput.addEventListener('input', () => {
  if (!isBreakMode && !isRunning) {
    remainingSeconds = Number(studyMinutesInput.value) * 60;
    updateDisplay();
  }
});

breakMinutesInput.addEventListener('input', () => {
  if (isBreakMode && !isRunning) {
    remainingSeconds = Number(breakMinutesInput.value) * 60;
    updateDisplay();
  }
});

musicFileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  musicPlayer.src = url;
  musicPlayer.load();
  toggleMusicBtn.disabled = false;
  toggleMusicBtn.innerHTML = '<span>▶</span> Play soundtrack';
  fileName.textContent = file.name;
});

toggleMusicBtn.addEventListener('click', async () => {
  if (!musicPlayer.src) {
    alert('Choose a music file first.');
    return;
  }

  if (musicPlayer.paused) {
    try {
      await musicPlayer.play();
      toggleMusicBtn.innerHTML = '<span>Ⅱ</span> Pause soundtrack';
    } catch (error) {
      console.error('Audio playback failed:', error);
      alert('Your browser blocked the music. Please click again.');
    }
  } else {
    musicPlayer.pause();
    toggleMusicBtn.innerHTML = '<span>▶</span> Play soundtrack';
  }
});

updateDisplay();
