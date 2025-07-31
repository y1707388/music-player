const playerContainer = document.querySelector('.player-container');
const title = document.getElementById('title');
const artist = document.getElementById('artist');
const audio = document.querySelector('audio');
const cover = document.getElementById('album-art');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const progressContainer = document.getElementById('progress-container');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playlist = document.getElementById('playlist');
const volumeSlider = document.getElementById('volume-slider');
const themeToggle = document.getElementById('theme-toggle');

// Song data
const songs = [
  {
    name: 'hey',
    displayName: 'Hey',
    artist: 'Purrple Cat',
  },
  {
    name: 'summer',
    displayName: 'Summer',
    artist: 'Purrple Cat',
  },
  {
    name: 'ukulele',
    displayName: 'Ukulele',
    artist: 'Purrple Cat',
  },
];

// Check if Playing
let isPlaying = false;

// Play
function playSong() {
  isPlaying = true;
  playerContainer.classList.add('play');
  playBtn.classList.replace('fa-play', 'fa-pause');
  playBtn.setAttribute('title', 'Pause');
  audio.play();
}

// Pause
function pauseSong() {
  isPlaying = false;
  playerContainer.classList.remove('play');
  playBtn.classList.replace('fa-pause', 'fa-play');
  playBtn.setAttribute('title', 'Play');
  audio.pause();
}

// Play or Pause Event Listener
playBtn.addEventListener('click', () => (isPlaying ? pauseSong() : playSong()));

// Update DOM
function loadSong(song) {
  title.textContent = song.displayName;
  artist.textContent = song.artist;
  audio.src = `music/${song.name}.mp3`;
  cover.src = `images/${song.name}.jpg`;
  highlightCurrentTrack();
}

// Current Song
let songIndex = 0;

// Previous Song
function prevSong() {
  songIndex--;
  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }
  loadSong(songs[songIndex]);
  playSong();
}

// Next Song
function nextSong() {
  songIndex++;
  if (songIndex > songs.length - 1) {
    songIndex = 0;
  }
  loadSong(songs[songIndex]);
  playSong();
}

// On Load - Select First Song
loadSong(songs[songIndex]);

// Update Progress Bar & Time
function updateProgressBar(e) {
  if (isPlaying) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    progressContainer.setAttribute('aria-valuenow', progressPercent);

    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) { durationSeconds = `0${durationSeconds}`; }
    if (durationSeconds) { durationEl.textContent = `${durationMinutes}:${durationSeconds}`; }

    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) { currentSeconds = `0${currentSeconds}`; }
    currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
  }
}

// Set Progress Bar
let isDragging = false;

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const { duration } = audio;
    audio.currentTime = (clickX / width) * duration;
}

function dragStart(e) {
    isDragging = true;
    setProgress.call(this, e);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
}

function dragMove(e) {
    if (isDragging) {
        const progressContainerRect = progressContainer.getBoundingClientRect();
        const width = progressContainer.clientWidth;
        const clickX = e.clientX - progressContainerRect.left;
        const { duration } = audio;
        const newTime = (Math.max(0, Math.min(clickX, width)) / width) * duration;
        if (!isNaN(newTime)) {
            audio.currentTime = newTime;
        }
    }
}

function dragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
}

// Create Playlist
function createPlaylist() {
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.textContent = `${song.displayName} - ${song.artist}`;
        li.setAttribute('data-index', index);
        playlist.appendChild(li);
    });
}

// Play song from playlist
function playFromPlaylist(e) {
    if (e.target.tagName === 'LI') {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        if (index !== songIndex) {
            songIndex = index;
            loadSong(songs[songIndex]);
            playSong();
        }
    }
}

// Highlight current track
function highlightCurrentTrack() {
    const playlistItems = document.querySelectorAll('#playlist li');
    playlistItems.forEach((item, index) => {
        if (index === songIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Volume Control
function setVolume() {
    audio.volume = volumeSlider.value;
}

// Dark Mode Toggle
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// Check Local Storage For Theme
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        themeToggle.checked = true;
    }
}

// Keyboard Controls
function handleKeyPress(e) {
    if (e.code === 'Space') {
        e.preventDefault();
        isPlaying ? pauseSong() : playSong();
    } else if (e.code === 'ArrowLeft') {
        prevSong();
    } else if (e.code === 'ArrowRight') {
        nextSong();
    }
}

// Event Listeners
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
audio.addEventListener('timeupdate', updateProgressBar);
audio.addEventListener('ended', nextSong);
progressContainer.addEventListener('mousedown', dragStart);
playlist.addEventListener('click', playFromPlaylist);
volumeSlider.addEventListener('input', setVolume);
themeToggle.addEventListener('change', switchTheme);
document.addEventListener('keydown', handleKeyPress);

// On Load
createPlaylist();
