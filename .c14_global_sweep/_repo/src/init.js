load('api_timer.js');
load('api_gpio.js');

let led = 2;

Timer.set(1000, Timer.REPEAT, function() {
  let val = GPIO.toggle(led);
  print('LED toggled:', val);
}, null);
