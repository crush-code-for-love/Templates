const invitation = document.getElementById('invitation');
const envelopeStage = document.getElementById('envelope-stage');
const letterView = document.getElementById('letter-view');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const acceptButton = document.getElementById('accept-letter');
const declineButton = document.getElementById('decline-letter');
const declineSlot = document.getElementById('decline-slot');
const declinedView = document.getElementById('declined-view');
const keepsake = document.getElementById('keepsake');
const letterQuestion = document.getElementById('letter-question');
const originalQuestion = letterQuestion.textContent;
const hoverReactions = ['ဟာ 💔', 'အဲ့လို မလုပ်ပါနဲ့ 😔', 'ငြင်းချင်ရင် မိအောင်ဖမ်း XD', 'မရဘူးပဲ', 'လက်ခံလိုက်ပါတော့ 🫠'];
const songList = document.getElementById('song-list');
const songDropdown = document.getElementById('song-dropdown');
const selectedCover = document.getElementById('selected-cover');
const selectedTitle = document.getElementById('selected-title');
const selectedArtist = document.getElementById('selected-artist');
const musicLink = document.getElementById('music-link');
const musicPlayer = document.getElementById('music-player');
const musicError = document.getElementById('music-error');
const record = document.getElementById('record');
const recordCover = document.getElementById('record-cover');
const previousTrack = document.getElementById('previous-track');
const playTrack = document.getElementById('play-track');
const nextTrack = document.getElementById('next-track');
const progress = document.getElementById('track-progress');
const elapsedTime = document.getElementById('elapsed-time');
const trackDuration = document.getElementById('track-duration');
const heartFireworks = document.getElementById('heart-fireworks');

document.getElementById('letter-title').textContent = 'Dear ' + confessionTemplate.recipient + ',';
document.getElementById('keepsake-name').textContent = confessionTemplate.recipient;

const photoStrip = document.getElementById('photo-strip');
const photoNumbers = new Intl.NumberFormat('my');
confessionTemplate.photos.forEach(({ src, caption, alt }, index) => {
  const frame = document.createElement('figure');
  const placeholder = document.createElement('div');
  const heart = document.createElement('span');
  heart.setAttribute('aria-hidden', 'true');
  heart.textContent = '♡';
  placeholder.className = 'photo-image';
  placeholder.append(heart, 'ဓာတ်ပုံ ' + photoNumbers.format(index + 1));

  const photo = document.createElement('img');
  photo.className = 'photo-image';
  photo.alt = alt;
  photo.loading = 'lazy';
  if (src) {
    photo.addEventListener('error', () => photo.replaceWith(placeholder), { once: true });
    photo.src = src;
  }
  const label = document.createElement('figcaption');
  label.textContent = caption;
  frame.append(src ? photo : placeholder, label);
  photoStrip.append(frame);
});

const reasonList = document.getElementById('reason-list');
for (const reason of confessionTemplate.reasons) {
  const item = document.createElement('li');
  item.textContent = reason;
  reasonList.append(item);
}

let selectedSong = -1;
const songButtons = confessionTemplate.songs.map((song, index) => {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'song-option';
  button.setAttribute('aria-pressed', 'false');

  const art = document.createElement('span');
  art.className = 'song-art';
  art.setAttribute('aria-hidden', 'true');
  art.textContent = '♫';
  if (song.cover) {
    const cover = document.createElement('img');
    cover.alt = '';
    cover.loading = 'lazy';
    cover.addEventListener('error', () => cover.remove(), { once: true });
    cover.src = song.cover;
    art.append(cover);
  }

  const label = document.createElement('span');
  const title = document.createElement('strong');
  title.textContent = song.title;
  const artist = document.createElement('span');
  artist.className = 'song-artist';
  artist.textContent = song.artist || '';
  label.append(title, artist);

  button.append(art, label);
  item.append(button);
  songList.append(item);
  button.addEventListener('click', () => {
    selectSong(index, true);
    songDropdown.open = false;
    songDropdown.querySelector('summary').focus({ preventScroll: true });
  });
  return button;
});

function selectSong(index, play = false) {
  const song = confessionTemplate.songs[index];
  if (!song) return;
  if (selectedSong !== index) {
    if (selectedSong >= 0) songButtons[selectedSong].setAttribute('aria-pressed', 'false');
    selectedSong = index;
    songButtons[index].setAttribute('aria-pressed', 'true');
    selectedTitle.textContent = song.title;
    selectedArtist.textContent = song.artist || '';
    selectedCover.hidden = !song.cover;
    if (song.cover) selectedCover.src = song.cover;
    musicError.hidden = true;
    musicPlayer.src = song.src;
    recordCover.hidden = !song.cover;
    if (song.cover) recordCover.src = song.cover;
    setPlaying(false);
    updateTimeline();
    musicLink.hidden = !song.url;
    if (song.url) musicLink.href = song.url;
  }
  if (play) {
    musicPlayer.play().catch(error => {
      if (error.name !== 'AbortError') musicError.hidden = false;
    });
  }
}

selectedCover.addEventListener('error', () => { selectedCover.hidden = true; });
songDropdown.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    songDropdown.open = false;
    songDropdown.querySelector('summary').focus();
  }
});

function setPlaying(playing) {
  record.classList.toggle('is-playing', playing);
  playTrack.classList.toggle('is-playing', playing);
  playTrack.setAttribute('aria-label', playing ? 'သီချင်း ခဏရပ်မယ်' : 'သီချင်းဖွင့်မယ်');
}

function formatTime(seconds) {
  const whole = Math.floor(seconds);
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

function updateTimeline() {
  const duration = Number.isFinite(musicPlayer.duration) ? musicPlayer.duration : 0;
  const current = Math.min(musicPlayer.currentTime, duration);
  progress.disabled = duration === 0;
  progress.max = duration;
  progress.value = current;
  progress.style.setProperty('--progress', (duration ? current / duration * 100 : 0) + '%');
  progress.setAttribute('aria-valuetext', formatTime(current) + ' / ' + formatTime(duration));
  elapsedTime.textContent = formatTime(current);
  trackDuration.textContent = formatTime(duration);
}

function switchSong(direction) {
  const count = confessionTemplate.songs.length;
  selectSong((selectedSong + direction + count) % count, !musicPlayer.paused);
}

previousTrack.disabled = nextTrack.disabled = songButtons.length < 2;
playTrack.disabled = songButtons.length === 0;
previousTrack.addEventListener('click', () => switchSong(-1));
nextTrack.addEventListener('click', () => switchSong(1));
playTrack.addEventListener('click', () => {
  if (musicPlayer.paused) selectSong(selectedSong, true);
  else musicPlayer.pause();
});
progress.addEventListener('input', () => { musicPlayer.currentTime = Number(progress.value); });
recordCover.addEventListener('error', () => { recordCover.hidden = true; });
musicLink.addEventListener('click', () => musicPlayer.pause());
musicPlayer.addEventListener('playing', () => setPlaying(true));
for (const event of ['pause', 'ended', 'emptied']) {
  musicPlayer.addEventListener(event, () => setPlaying(false));
}
for (const event of ['timeupdate', 'durationchange', 'emptied']) {
  musicPlayer.addEventListener(event, updateTimeline);
}
musicPlayer.addEventListener('error', () => {
  setPlaying(false);
  musicError.hidden = false;
});
function focusScene(titleId) {
  window.scrollTo(0, 0);
  document.getElementById(titleId).focus({ preventScroll: true });
}

let hoverCount = 0;

function revealLetter() {
  hoverCount = 0;
  letterQuestion.textContent = originalQuestion;
  invitation.hidden = true;
  letterView.hidden = false;
  focusScene('letter-title');
}

let opening = false;

function openLetter() {
  if (opening) return;
  opening = true;
  envelopeStage.disabled = true;
  envelopeStage.classList.add('is-opening');

  if (reducedMotion.matches) {
    revealLetter();
  } else {
    window.setTimeout(revealLetter, 800);
  }
}

function resetDeclineButton() {
  declineButton.classList.remove('is-dodging');
  declineButton.removeAttribute('style');
  declineSlot.removeAttribute('style');
}

function returnToEnvelope() {
  resetDeclineButton();
  letterView.hidden = true;
  declinedView.hidden = true;
  musicPlayer.pause();
  keepsake.hidden = true;
  envelopeStage.classList.remove('is-opening');
  opening = false;
  invitation.hidden = false;
  envelopeStage.disabled = false;
  window.scrollTo(0, 0);
  envelopeStage.focus({ preventScroll: true });
}

function dodgePointer(event) {
  if (event.pointerType !== 'mouse' || reducedMotion.matches || letterView.hidden) return;

  const button = declineButton.getBoundingClientRect();
  const accept = acceptButton.getBoundingClientRect();
  const edge = 12;
  const maxLeft = Math.max(edge, document.documentElement.clientWidth - button.width - edge);
  const maxTop = Math.max(edge, document.documentElement.clientHeight - button.height - edge);
  const question = letterQuestion.getBoundingClientRect();
  const clearance = 16;
  const minimumShift = Math.min(110, Math.min(maxLeft - edge, maxTop - edge) * .34);
  const candidates = Array.from({ length: 36 }, () => [
    edge + Math.random() * (maxLeft - edge),
    edge + Math.random() * (maxTop - edge),
  ]);
  const overlaps = (x, y, rect) => (
    x < rect.right + clearance && x + button.width > rect.left - clearance
    && y < rect.bottom + clearance && y + button.height > rect.top - clearance
  );
  const next = candidates.find(([x, y]) => (
    Math.hypot(x - button.x, y - button.y) > minimumShift
    && (event.clientX < x - clearance || event.clientX > x + button.width + clearance
        || event.clientY < y - clearance || event.clientY > y + button.height + clearance)
    && !overlaps(x, y, accept)
    && !overlaps(x, y, question)
  ));
  if (!next) return;

  if (event.type === 'pointerenter' && hoverCount < hoverReactions.length) {
    letterQuestion.textContent = hoverReactions[hoverCount];
    hoverCount += 1;
  }
  if (!declineButton.classList.contains('is-dodging')) {
    declineSlot.style.width = button.width + 'px';
    declineSlot.style.height = button.height + 'px';
    declineButton.style.width = button.width + 'px';
    declineButton.style.left = button.left + 'px';
    declineButton.style.top = button.top + 'px';
    declineButton.classList.add('is-dodging', 'is-jumping');
    declineButton.getBoundingClientRect();
    declineButton.classList.remove('is-jumping');
  }

  const [left, top] = next;
  declineButton.style.left = left + 'px';
  declineButton.style.top = top + 'px';
}

envelopeStage.addEventListener('click', openLetter);
document.getElementById('close-letter').addEventListener('click', returnToEnvelope);
document.getElementById('declined-return').addEventListener('click', returnToEnvelope);

declineButton.addEventListener('pointerenter', dodgePointer);
declineButton.addEventListener('pointerdown', dodgePointer);
declineButton.addEventListener('click', event => {
  if (event.pointerType === 'mouse' && !reducedMotion.matches) return;
  resetDeclineButton();
  letterView.hidden = true;
  declinedView.hidden = false;
  focusScene('declined-title');
});
window.addEventListener('resize', resetDeclineButton);
reducedMotion.addEventListener('change', resetDeclineButton);

let fireworksTimer;

function clearFireworks() {
  window.clearTimeout(fireworksTimer);
  heartFireworks.replaceChildren();
}

function celebrate() {
  clearFireworks();
  if (reducedMotion.matches) return;

  const bursts = [[50, 45], [19, 23], [81, 27], [16, 72], [82, 74], [53, 16], [48, 83]];
  const colors = ['#b73157', '#e15d7d', '#f38fa5', '#f9b3be', '#fabd67'];
  const reach = Math.min(window.innerWidth * .38, 225);
  const particles = document.createDocumentFragment();

  bursts.forEach(([x, y], index) => {
    for (let ray = 0; ray < 15; ray += 1) {
      const angle = (ray / 15) * Math.PI * 2 + Math.random() * .3;
      const radius = reach * (.44 + Math.random() * .56);
      const heart = document.createElement('span');
      heart.textContent = ray % 4 === 0 ? '♡' : '♥';
      heart.style.left = x + '%';
      heart.style.top = y + '%';
      heart.style.color = colors[(ray + index) % colors.length];
      heart.style.fontSize = (13 + Math.random() * 21) + 'px';
      heart.style.animationDelay = index * 115 + 'ms';
      heart.style.setProperty('--x', Math.cos(angle) * radius + 'px');
      heart.style.setProperty('--y', Math.sin(angle) * radius + 'px');
      heart.style.setProperty('--turn', (angle * 38 - 120) + 'deg');
      particles.append(heart);
    }
  });

  heartFireworks.append(particles);
  fireworksTimer = window.setTimeout(clearFireworks, 2450);
}

acceptButton.addEventListener('click', () => {
  resetDeclineButton();
  letterView.hidden = true;
  keepsake.hidden = false;
  if (selectedSong < 0) selectSong(0);
  focusScene('keepsake-title');
  celebrate();
});

document.getElementById('back-to-letter').addEventListener('click', () => {
  clearFireworks();
  musicPlayer.pause();
  keepsake.hidden = true;
  revealLetter();
});
