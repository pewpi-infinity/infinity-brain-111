load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 002 activates: couples');
  return {phase: 0.0566052};
});

print('Mongoose OS Brain 002 online – hydrogen valve ready');
