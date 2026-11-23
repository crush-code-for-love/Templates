/* Editable festival configuration. World distances are meters; timings are seconds. */
window.LanternLetter = {};
window.LanternLetter.config = {
  language: 'my', // Change to 'en' for English interface hints.
  camera: {
    startPitch: 0, endPitch: 12, lookUpDuration: 7, // Gentle look-up in degrees; transition seconds.
    focalLength: .95, eyeHeight: 1.65, horizon: .65, nearClip: .12 // Focal multiplier of short viewport edge, meters, screen fraction, meters.
  },
  world: {
    count: { normal: 120, lite: 60 }, // Includes the held and letter lanterns, allocated once.
    zRange: [15, 70], sizeRange: [.55, .85], // Distant lanterns stay much smaller than the held heart.
    distantDrift: .04, // Background depth drift in meters/second; never approaches the foreground.
    riseSpeed: [.35, .75], swayAmount: .10, swaySpeed: .65, tilt: .035, // Meters/second, meters, radians/second, radians.
    overheadSpread: 1.6, farBrightness: .30, // Height/distance spread for the gentle tilt; distant glow floor.
    driftZ: [-.85, .08], accelerationTime: 1.8, releaseRise: .55, releaseDrift: 1.25, // Released heart recedes into the sky rather than passing overhead.
    mingleScale: .22, // Join the crowd when projected width reaches this fraction of its held size.
    launchDepth: 3.6, // Initial drift away in meters, before the wind carries lanterns overhead.
    heroZ: 1.9, heroSize: .72, // Held lantern's world distance and width in meters.
    palette: ['#f6a16c', '#f3b876', '#ee8e87'] // Peach, champagne and blush hearts.
  },
  focus: {
    idleSharpness: .015, blurLevels: [9, 15], environmentBlur: 7, // Strong opening defocus; held lantern and torch remain sharp.
    glowScale: 2.7, bokehSpread: 1.4, // Glow diameter in lantern widths, additional defocus spread.
    sharpenDuration: 5, refocusOnNote: .85 // Seconds and blur amount reserved for milestones 3/5.
  },
  paper: {
    variants: 2, views: 3, resolutions: [48, 112], sizeThreshold: 36, wrinkles: 95, // Cached folds, viewing angles, pixel sizes, selection threshold, crease count.
    maxBelow: .12, // Preserve the shallow opening from the reference angle, even high in the sky.
    coolTop: '#b34a65', warmTop: '#db6d69', hotPaper: '#ffdc9e', rim: '#ffe7bb', coolRim: '#e29aa0',
    unlitTop: '#61534f', unlitBottom: '#9d8c70', unlitRim: '#a48b69', // Dim but readable warm paper before ignition.
    glowStrength: .55 // Additive halo opacity, identical for all released lanterns.
  },
  festival: {
    skyTop: '#090b13', skyMiddle: '#111320', skyBottom: '#30212a',
    temple: '#75451c', templeEdge: '#ffdc83', templeGold: '#dca540', templeX: .16, // Left-hand golden pagoda inspired by Tazaungdaing 1.
    hazeColor: '#9a8190', hazeOpacity: .10, hazeSpeed: 3, // Thin moving haze; opacity and pixels/second.
    crowdSway: 2, crowdSpeed: .55, lightPulse: .12, // Pixels, radians/second, festival-light brightness variation.
    crowdFar: '#211822', crowdNear: '#0b0c14', people: 24 // Silhouette colors; people per foreground row.
  },
  celebration: { duration: 5, text: 'ပျော်ရွှင်စရာ တန်ဆောင်တိုင် ဖြစ်ပါစေ', particles: 64, liteParticles: 28, volume: .22 }, // Seconds, pooled sparks per burst, master sound level.
  moon: {
    x: .77, y: .18, radius: .047, // Final viewport position and radius relative to the short edge.
    color: '#fff0cd', edge: '#d9b990', halo: '#f7d7ab' // Warm full moon revealed by the gentle tilt.
  },
  letterLantern: {
    offset: [.2, 0, -4], noteSize: [.12, .18], noteFallDuration: 4, // Begins behind the viewer; world meters and seconds.
    riseSpeed: .55, followDelay: 1.1, passDuration: 7, forwardSpeed: 1.1, passScreenY: .12, // Seconds, meters and upper-screen crossing height.
    threadLength: .20, noteSway: .15, noteSpeed: 1.4, threadColor: '#c9a87d' // Meters, radians, radians/second.
  },
  letter: {
    to: 'မင်း', greeting: 'ချစ်ရတဲ့ မင်းဆီသို့…',
    body: ['ဒီတန်ဆောင်တိုင်ညမှာ ဆုတောင်းတစ်ခု ရှိတယ်။', 'မင်းရဲ့နေ့ရက်တိုင်း ပျော်ရွှင်မှုတွေနဲ့ ပြည့်နေပါစေ။', 'မီးပုံးလေးနဲ့အတူ ငါ့ရင်ထဲက စကားလေးကို ပို့လိုက်ပါတယ်။', 'အရမ်းချစ်တယ်နော်။'],
    signature: 'မင်းကို သဘောကျနေတဲ့သူ', anonymous: false,
    anonymousHint: 'မင်းနဲ့ အတန်းတူတဲ့ တစ်ယောက်'
  },
  strings: {
    my: { hint: 'ခဏလေး… ဒီညရဲ့အလှကို ခံစားကြည့်ပါ။', lightHint: 'မီးပုံးအောက်ခြေနားမှာ မီးတုတ်ကို ခဏထားပေးပါ။', replay: 'ပြန်ကြည့်မယ်', another: 'မီးပုံးထပ်လွှတ်မယ်', thanks: 'ဆုတောင်းလေး ပြည့်ပါစေ။', lite: 'ပေါ့ပါးစနစ်', sound: 'အသံ', scene: 'ကြယ်တွေ၊ တောင်တန်းတွေ၊ စေတီတွေနဲ့ တန်ဆောင်တိုင်ည' },
    en: { hint: 'Stay a little. Let the night settle around you.', lightHint: 'Hold the flame near the wick.', replay: 'Replay', another: 'Light another lantern', thanks: 'May your wish find its way.', lite: 'Lite mode', sound: 'Sound', scene: 'A Tazaungdaing night with stars, hills and pagodas' }
  },
  colors: {
    highSky: [[0, '#050916'], [.5, '#0b1020'], [1, '#141b30']], // High-angle sky stops.
    stars: '#e5e7f5', flame: ['#fff4c8', '#ffc45d', '#ed6e35'], paper: '#fff9f7'
  },
  timings: { hintDelay: 3, heat: 2.5, heatDecay: 5, mingle: 4, lineReveal: 1.3 }, // All seconds.
  counts: { normal: { stars: 170, particles: 100 }, lite: { stars: 75, particles: 35 } },
  scene: { seed: 2026, maxDpr: 2, maxDelta: .05 }, // Fixed layout seed, pixel-ratio cap, maximum simulation step.

  lighting: { reach: 35, holdSlop: 28, vibration: 35 }, // Pointer proximity/movement in pixels, catch vibration in milliseconds.

  torch: {
    startX: .77, startY: .85, // Initial flame position as viewport fractions.
    followSpeed: 18, flameSize: 32, stickLength: 90, glowSize: 160, // Follow rate and CSS pixel sizes.
    emberRate: 23, emberLife: 1.4, emberSpeed: 45, emberDrift: 16, // Per second, seconds, pixels/second.
    wood: '#69442e', woodHighlight: '#b18353'
  },
  flight: { torchDrop: .24, torchFade: .75, reducedFade: .65 }, // Viewport drop fraction and fade seconds.

  note: {
    ink: '#654653', accent: '#ba7186', unfoldTime: 1.1, // Paper text colors and opening duration in seconds.
    dropSway: 75, dropRotation: 24, // Pixels and degrees for paper drift.
    backgroundDim: .25 // Dim the festival as focus returns to the falling note.
  },
  performance: { lowFps: 24, lowFpsSeconds: 2, manualLite: false },
  audio: { enabled: false, match: '', crackle: '', wind: '' }, // Optional assets/ paths, added later.
  formation: { depth: 18, width: .78, height: .27 }, // One-time group depth and viewport dimensions; rise speed matches the festival average.
  explore: { maxPitch: 35, scrollSpeed: .045, dragSpeed: .09, smoothing: 8 }, // Degrees, degrees/pixel, follow rate after closing the letter.
  sharing: { maxNameLength: 80, maxMessageLength: 4000 }
};

// URL values remain plain strings. Display them only with textContent, never HTML.
window.LanternLetter.config.strings.my.lightHint = 'မီးစာနားမှာ မီးတုတ်ကိုထားပါ၊ ဒါမှမဟုတ် မီးပုံးကို ဖိထားပါ။';
window.LanternLetter.config.strings.en.lightHint = 'Bring the flame to the wick, or press and hold the lantern.';
window.LanternLetter.config.strings.my.keyboardHint = 'Space သို့မဟုတ် Enter ကို ဖိထားပြီး မီးထွန်းနိုင်ပါတယ်။';
window.LanternLetter.config.strings.en.keyboardHint = 'Hold Space or Enter to light the lantern.';
window.LanternLetter.config.strings.my.audioMissing = 'အသံဖိုင် မထည့်ရသေးပါ';
window.LanternLetter.config.strings.en.audioMissing = 'No audio files configured';
window.LanternLetter.config.strings.my.audioFailed = 'အသံဖိုင် ဖွင့်မရပါ';
window.LanternLetter.config.strings.en.audioFailed = 'Audio unavailable';
(() => {
  const config = window.LanternLetter.config;
  const params = new URLSearchParams(location.search);
  if (params.has('to')) {
    config.letter.to = params.get('to').slice(0, config.sharing.maxNameLength);
    config.letter.greeting = config.letter.to + (config.language === 'my' ? ' ဆီသို့…' : ',');
  }
  if (params.has('msg')) config.letter.body = params.get('msg').slice(0, config.sharing.maxMessageLength).split('\n');
})();
