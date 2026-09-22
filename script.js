const timerDisplay = document.getElementById('timer');
const modeText = document.getElementById('modeText');
const studyHoursInput = document.getElementById('studyHours');
const studyMinutesInput = document.getElementById('studyMinutes');
const breakMinutesInput = document.getElementById('breakMinutes');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const musicFileInput = document.getElementById('musicFile');
const toggleMusicBtn = document.getElementById('toggleMusicBtn');
const musicPlayer = document.getElementById('musicPlayer');
const openSpotifyLink = document.getElementById('openSpotifyLink');
const openYoutubeLink = document.getElementById('openYoutubeLink');
const activeMusicPlatform = document.getElementById('activeMusicPlatform');
const progressBar = document.getElementById('progressBar');
const sessionCount = document.getElementById('sessionCount');
const sessionStatus = document.getElementById('sessionStatus');
const timeHint = document.getElementById('timeHint');
const fileName = document.getElementById('fileName');
const completionNote = document.getElementById('completionNote');
const spotifyLoginBtn = document.getElementById('spotifyLoginBtn');
const spotifyAccountActions = document.getElementById('spotifyAccountActions');
const changeSpotifyAccountBtn = document.getElementById('changeSpotifyAccountBtn');
const keepSpotifyAccountBtn = document.getElementById('keepSpotifyAccountBtn');
const spotifyStatus = document.getElementById('spotifyStatus');
const profileControls = document.getElementById('profileControls');
const loadPlaylistsBtn = document.getElementById('loadPlaylistsBtn');
const loadLikedSongsBtn = document.getElementById('loadLikedSongsBtn');
const loadSavedShowsBtn = document.getElementById('loadSavedShowsBtn');
const loadRecentTracksBtn = document.getElementById('loadRecentTracksBtn');
const playPauseSpotifyBtn = document.getElementById('playPauseSpotifyBtn');
const openSpotifyAudioBtn = document.getElementById('openSpotifyAudioBtn');
const stopSpotifyBtn = document.getElementById('stopSpotifyBtn');
const currentAudioText = document.getElementById('currentAudioText');
const spotifySearchForm = document.getElementById('spotifySearchForm');
const spotifySearchInput = document.getElementById('spotifySearchInput');
const spotifyResults = document.getElementById('spotifyResults');
const playlistPagination = document.getElementById('playlistPagination');
const previousPlaylistsBtn = document.getElementById('previousPlaylistsBtn');
const nextPlaylistsBtn = document.getElementById('nextPlaylistsBtn');
const playlistPageLabel = document.getElementById('playlistPageLabel');

const spotifyClientId = '8bb040f2500d4c0f9292055af9ca1a06';
const spotifyRedirectUri = `${window.location.origin}${window.location.pathname}`;
const spotifyScopes = 'streaming user-read-email user-read-private user-modify-playback-state user-read-playback-state playlist-read-private user-library-read user-read-recently-played';
const spotifyAuthVersion = 'profile-library-v2';
let spotifyAccessToken = null;
let spotifyPlayer = null;
let spotifyDeviceId = null;
let currentSpotifyUri = null;
let currentMusicPlatformUrl = null;
let userPlaylists = [];
let playlistPage = 0;
const playlistsPerPage = 4;

function getFocusDurationSeconds() {
  const totalMinutes = Number(studyHoursInput.value) * 60 + Number(studyMinutesInput.value);
  return Math.max(1, totalMinutes * 60);
}

let totalSeconds = getFocusDurationSeconds();
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
  const currentTotal = isBreakMode ? Number(breakMinutesInput.value) * 60 : getFocusDurationSeconds();
  progressBar.style.width = `${Math.max(0, Math.min(100, ((currentTotal - remainingSeconds) / currentTotal) * 100))}%`;
  document.title = `${formatTime(remainingSeconds)} | Solo Focusing`;
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

  const focusSessionCompleted = !isBreakMode;
  isBreakMode = !isBreakMode;
  completionNote.hidden = !focusSessionCompleted;
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
  completionNote.hidden = true;
  sessionStatus.textContent = isBreakMode ? 'Break in progress' : 'Focus in progress';
  timeHint.textContent = isBreakMode ? 'Step away for a moment.' : 'You are exactly where you need to be.';
  timerId = setInterval(tick, 1000);
}

function pauseTimer() {
  stopTimer();
}

function resetTimer() {
  stopTimer();
  completionNote.hidden = true;
  isBreakMode = false;
  totalSeconds = getFocusDurationSeconds();
  remainingSeconds = totalSeconds;
  sessionStatus.textContent = 'Ready to focus';
  timeHint.textContent = 'Your focus session starts when you are ready.';
  updateDisplay();
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

function updateFocusDuration() {
  if (!isBreakMode && !isRunning) {
    remainingSeconds = getFocusDurationSeconds();
    updateDisplay();
  }
}

studyHoursInput.addEventListener('input', updateFocusDuration);
studyMinutesInput.addEventListener('input', updateFocusDuration);

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
  currentSpotifyUri = null;
  currentMusicPlatformUrl = null;
  activeMusicPlatform.textContent = 'Currently using Local audio';
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

function base64UrlEncode(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function createSpotifyChallenge() {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(64)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: base64UrlEncode(digest) };
}

async function connectSpotify() {
  const { verifier, challenge } = await createSpotifyChallenge();
  sessionStorage.setItem('spotify_code_verifier', verifier);
  const params = new URLSearchParams({
    client_id: spotifyClientId,
    response_type: 'code',
    redirect_uri: spotifyRedirectUri,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: spotifyScopes
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeSpotifyCode(code) {
  const verifier = sessionStorage.getItem('spotify_code_verifier');
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: spotifyClientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotifyRedirectUri,
      code_verifier: verifier
    })
  });
  if (!response.ok) throw new Error('Spotify login could not be completed.');
  const token = await response.json();
  spotifyAccessToken = token.access_token;
  localStorage.setItem('spotify_access_token', spotifyAccessToken);
  localStorage.setItem('spotify_auth_version', spotifyAuthVersion);
  window.history.replaceState({}, document.title, spotifyRedirectUri);
}

function initializeSpotifyPlayer() {
  if (!spotifyAccessToken || !window.Spotify || spotifyPlayer) return;
  spotifyPlayer = new Spotify.Player({
    name: 'Solo Focusing',
    getOAuthToken: (callback) => callback(spotifyAccessToken),
    volume: 0.6
  });
  spotifyPlayer.addListener('ready', ({ device_id: deviceId }) => {
    spotifyDeviceId = deviceId;
    spotifyStatus.textContent = 'Spotify connected. Search for a track to play.';
  });
  spotifyPlayer.addListener('not_ready', () => {
    spotifyStatus.textContent = 'Spotify player is offline.';
  });
  spotifyPlayer.addListener('initialization_error', ({ message }) => {
    spotifyStatus.textContent = message;
  });
  spotifyPlayer.addListener('account_error', () => {
    spotifyStatus.textContent = 'Spotify in-page playback needs Premium. Use the local audio player above to stay on this website.';
  });
  spotifyPlayer.connect();
}

async function searchSpotify(event) {
  event.preventDefault();
  const query = spotifySearchInput.value.trim();
  if (!query || !spotifyAccessToken) return;
  spotifyStatus.textContent = 'Searching Spotify...';
  const response = await fetch(`https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Spotify search failed. Please reconnect.';
    return;
  }
  const data = await response.json();
  renderSpotifyTracks(data.tracks.items);
  spotifyStatus.textContent = `${data.tracks.items.length} tracks found.`;
}

function renderSpotifyTracks(tracks) {
  spotifyResults.innerHTML = tracks.map((track) => `
    <button class="spotify-track" data-uri="${track.uri}" data-title="${encodeURIComponent(`${track.name} · ${track.artists.map((artist) => artist.name).join(', ')}`)}">
      ${track.album.images[2] ? `<img src="${track.album.images[2].url}" alt="" />` : ''}
      <span>${track.name} · ${track.artists.map((artist) => artist.name).join(', ')}</span>
    </button>
  `).join('');
  spotifyResults.querySelectorAll('.spotify-track').forEach((trackButton) => {
    trackButton.addEventListener('click', () => playSpotifyTrack(trackButton.dataset.uri, decodeURIComponent(trackButton.dataset.title)));
  });
}

function renderSpotifyPlaylists() {
  const start = playlistPage * playlistsPerPage;
  const visiblePlaylists = userPlaylists.slice(start, start + playlistsPerPage);
  spotifyResults.innerHTML = visiblePlaylists.map((playlist) => `
    <button class="spotify-track" data-playlist-id="${playlist.id}">
      ${playlist.images[0] ? `<img src="${playlist.images[0].url}" alt="${playlist.name} cover" />` : '<span class="playlist-cover-placeholder">♫</span>'}
      <span>${playlist.name} · ${playlist.owner.display_name}</span>
    </button>
  `).join('');
  spotifyResults.querySelectorAll('.spotify-track').forEach((playlistButton) => {
    playlistButton.addEventListener('click', () => loadSpotifyPlaylistById(playlistButton.dataset.playlistId));
  });
  playlistPageLabel.textContent = `Page ${playlistPage + 1} of ${Math.max(1, Math.ceil(userPlaylists.length / playlistsPerPage))}`;
  previousPlaylistsBtn.disabled = playlistPage === 0;
  nextPlaylistsBtn.disabled = start + playlistsPerPage >= userPlaylists.length;
  playlistPagination.hidden = userPlaylists.length <= playlistsPerPage;
}

async function loadUserPlaylists() {
  spotifyStatus.textContent = 'Loading your playlists...';
  const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Could not load your playlists.';
    return;
  }
  const data = await response.json();
  userPlaylists = data.items;
  playlistPage = 0;
  renderSpotifyPlaylists();
  spotifyStatus.textContent = `${data.items.length} of your playlists loaded.`;
}

async function loadLikedSongs() {
  spotifyStatus.textContent = 'Loading your liked songs...';
  const response = await fetch('https://api.spotify.com/v1/me/tracks?limit=50', {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Could not load your liked songs.';
    return;
  }
  const data = await response.json();
  renderSpotifyTracks(data.items.map((item) => item.track).filter(Boolean));
  spotifyStatus.textContent = `${data.items.length} liked songs loaded.`;
}

async function loadSavedShows() {
  spotifyStatus.textContent = 'Loading your saved podcasts...';
  const response = await fetch('https://api.spotify.com/v1/me/shows?limit=50', {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Could not load your saved podcasts.';
    return;
  }
  const data = await response.json();
  spotifyResults.innerHTML = data.items.map((item) => `
    <button class="spotify-track" data-show-id="${item.show.id}">
      ${item.show.images[0] ? `<img src="${item.show.images[0].url}" alt="${item.show.name} cover" />` : '<span class="playlist-cover-placeholder">♫</span>'}
      <span>${item.show.name}</span>
    </button>
  `).join('');
  spotifyResults.querySelectorAll('[data-show-id]').forEach((showButton) => {
    showButton.addEventListener('click', () => loadShowEpisodes(showButton.dataset.showId));
  });
  spotifyStatus.textContent = `${data.items.length} saved podcasts loaded.`;
}

async function loadShowEpisodes(showId) {
  spotifyStatus.textContent = 'Loading podcast episodes...';
  const response = await fetch(`https://api.spotify.com/v1/shows/${showId}/episodes?limit=50`, {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Could not load podcast episodes.';
    return;
  }
  const data = await response.json();
  spotifyResults.innerHTML = data.items.map((episode) => `
    <button class="spotify-track" data-uri="${episode.uri}" data-title="${encodeURIComponent(episode.name)}">
      ${episode.images[0] ? `<img src="${episode.images[0].url}" alt="${episode.name} cover" />` : ''}
      <span>${episode.name}</span>
    </button>
  `).join('');
  spotifyResults.querySelectorAll('[data-uri]').forEach((episodeButton) => {
    episodeButton.addEventListener('click', () => playSpotifyTrack(episodeButton.dataset.uri, decodeURIComponent(episodeButton.dataset.title)));
  });
  spotifyStatus.textContent = `${data.items.length} podcast episodes loaded.`;
}

async function loadRecentTracks() {
  spotifyStatus.textContent = 'Loading recently played tracks...';
  const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Could not load recently played tracks.';
    return;
  }
  const data = await response.json();
  renderSpotifyTracks(data.items.map((item) => item.track).filter(Boolean));
  spotifyStatus.textContent = `${data.items.length} recently played tracks loaded.`;
}

async function loadSpotifyPlaylistById(playlistId) {
  spotifyStatus.textContent = 'Loading playlist tracks...';
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
    headers: { Authorization: `Bearer ${spotifyAccessToken}` }
  });
  if (!response.ok) {
    spotifyStatus.textContent = 'Could not load that playlist.';
    return;
  }
  const data = await response.json();
  renderSpotifyTracks(data.items.map((item) => item.track).filter(Boolean));
  spotifyStatus.textContent = `${data.items.length} playlist tracks loaded.`;
}

async function playSpotifyTrack(trackUri, trackTitle = 'Spotify audio') {
  currentSpotifyUri = trackUri;
  currentMusicPlatformUrl = null;
  activeMusicPlatform.textContent = 'Currently using Spotify';
  if (!spotifyDeviceId) {
    spotifyStatus.textContent = 'Spotify playback needs Premium. Choose a local audio file above to play music here.';
    return;
  }
  const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${spotifyDeviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${spotifyAccessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ uris: [trackUri] })
  });
  currentAudioText.textContent = response.ok ? trackTitle : 'Nothing playing';
  spotifyStatus.textContent = response.ok ? 'Now playing on Spotify.' : 'Spotify in-page playback needs Premium. Local audio is available above.';
}

async function stopSpotifyPlayback() {
  if (!spotifyPlayer && !spotifyDeviceId) {
    spotifyStatus.textContent = 'Spotify is not playing.';
    return;
  }
  if (spotifyPlayer) await spotifyPlayer.pause();
  currentAudioText.textContent = 'Nothing playing';
  spotifyStatus.textContent = 'Spotify playback stopped.';
}

async function toggleSpotifyPlayback() {
  if (!spotifyPlayer) {
    spotifyStatus.textContent = 'Spotify in-page playback needs Premium. Use the local audio player above instead.';
    return;
  }
  const currentState = await spotifyPlayer.getCurrentState();
  if (!currentState) {
    spotifyStatus.textContent = 'No Spotify audio is currently selected.';
    return;
  }
  if (currentState.paused) await spotifyPlayer.resume();
  else await spotifyPlayer.pause();
  currentAudioText.textContent = currentState.paused ? 'Spotify track playing' : 'Spotify track paused';
  spotifyStatus.textContent = currentState.paused ? 'Spotify playback resumed.' : 'Spotify playback paused.';
}

function openCurrentSpotifyAudio() {
  if (currentSpotifyUri) {
    window.open(`https://open.spotify.com/${currentSpotifyUri.split(':').slice(1).join('/')}`, '_blank', 'noopener');
    return;
  }
  if (currentMusicPlatformUrl) {
    window.open(currentMusicPlatformUrl, '_blank', 'noopener');
    return;
  }
  if (!currentSpotifyUri && !currentMusicPlatformUrl) {
    spotifyStatus.textContent = 'Choose a music platform first.';
    return;
  }
}

function openSpotifyForPlatform(event) {
  event.preventDefault();
  activeMusicPlatform.textContent = 'Currently using Spotify';
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const webUrl = 'https://open.spotify.com/';
  if (isMobile) {
    window.location.href = 'spotify:';
    window.setTimeout(() => { window.location.href = webUrl; }, 900);
    return;
  }
  const appWindow = window.open('spotify:', '_blank');
  window.setTimeout(() => {
    if (appWindow && !appWindow.closed) appWindow.location.href = webUrl;
    else window.open(webUrl, '_blank', 'noopener');
  }, 900);
}

openYoutubeLink.addEventListener('click', () => {
  currentSpotifyUri = null;
  currentMusicPlatformUrl = 'https://music.youtube.com/';
  currentAudioText.textContent = 'YouTube Music';
  activeMusicPlatform.textContent = 'Currently using YouTube Music';
  spotifyStatus.textContent = 'YouTube Music playback is external. The current song cannot be read by this website.';
});

function handleSpotifyLoginClick() {
  if (spotifyAccessToken) {
    spotifyAccountActions.hidden = !spotifyAccountActions.hidden;
    return;
  }
  connectSpotify();
}

function changeSpotifyAccount() {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_auth_version');
  sessionStorage.removeItem('spotify_code_verifier');
  if (spotifyPlayer) spotifyPlayer.disconnect();
  window.location.reload();
}

spotifyLoginBtn.addEventListener('click', handleSpotifyLoginClick);
openSpotifyLink.addEventListener('click', openSpotifyForPlatform);
changeSpotifyAccountBtn.addEventListener('click', changeSpotifyAccount);
keepSpotifyAccountBtn.addEventListener('click', () => {
  spotifyAccountActions.hidden = true;
});
loadPlaylistsBtn.addEventListener('click', loadUserPlaylists);
loadLikedSongsBtn.addEventListener('click', loadLikedSongs);
loadSavedShowsBtn.addEventListener('click', loadSavedShows);
loadRecentTracksBtn.addEventListener('click', loadRecentTracks);
playPauseSpotifyBtn.addEventListener('click', toggleSpotifyPlayback);
openSpotifyAudioBtn.addEventListener('click', openCurrentSpotifyAudio);
stopSpotifyBtn.addEventListener('click', stopSpotifyPlayback);
spotifySearchForm.addEventListener('submit', searchSpotify);
previousPlaylistsBtn.addEventListener('click', () => {
  playlistPage -= 1;
  renderSpotifyPlaylists();
});
nextPlaylistsBtn.addEventListener('click', () => {
  playlistPage += 1;
  renderSpotifyPlaylists();
});


async function startSpotify() {
  const params = new URLSearchParams(window.location.search);
  try {
    if (localStorage.getItem('spotify_auth_version') !== spotifyAuthVersion) {
      localStorage.removeItem('spotify_access_token');
    }
    if (params.has('code')) await exchangeSpotifyCode(params.get('code'));
    spotifyAccessToken = spotifyAccessToken || localStorage.getItem('spotify_access_token');
    if (spotifyAccessToken) {
      spotifyLoginBtn.textContent = 'Spotify connected';
      profileControls.hidden = false;
      loadPlaylistsBtn.hidden = false;
      spotifySearchForm.hidden = false;
      if (window.Spotify) initializeSpotifyPlayer();
      else window.onSpotifyWebPlaybackSDKReady = initializeSpotifyPlayer;
      loadUserPlaylists();
    }
  } catch (error) {
    spotifyStatus.textContent = error.message;
  }
}

updateDisplay();
startSpotify();
