load('api_timer.js');
load('api_sys.js');
load('api_config.js');

let heartbeat = Cfg.get('guardian.heartbeat_ms');

Timer.set(heartbeat, true, function() {
  let now = Sys.uptime();
  print('[Guardian] Heartbeat — uptime:', now, 'seconds');
}, null);

print('[Guardian] Firmware Layer 0 initialized');
