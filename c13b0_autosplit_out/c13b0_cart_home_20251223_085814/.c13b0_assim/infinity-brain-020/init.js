load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 020 activates: video or place');
  return {phase: 0.566052};
});

print('Mongoose OS Brain 020 online – hydrogen valve ready');
