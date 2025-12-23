load('api_timer.js');
load('api_gpio.js');
load('api_pwm.js');
load('api_sys.js');
load('api_config.js');

let pin = Cfg.get('guardian.tone_pin');
let base = Cfg.get('guardian.pattern_ms');

GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
PWM.set(pin, 1000, 0); // silent

function tone(freq, dur) {
  PWM.set(pin, freq, 0.5);
  Timer.set(dur, 0, function() {
    PWM.set(pin, freq, 0);
  }, null);
}

// Gentle rotating patterns
let patterns = [
  function gentle() { tone(800, base); },
  function humor() { tone(1200, base); Timer.set(base, 0, () => tone(900, base), null); },
  function move() { tone(600, base * 2); },
  function calm() { tone(400, base * 3); }
];

let idx = 0;

Timer.set(300000, true, function() { // every 5 minutes max
  patterns[idx]();
  idx = (idx + 1) % patterns.length;
}, null);

print("[Guardian] Firmware Layer 0.5 (Tone Patterns) initialized");
