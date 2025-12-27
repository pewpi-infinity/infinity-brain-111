load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 007 activates: gambles (CEO decisions)');
  return {phase: 0.198118};
});

print('Mongoose OS Brain 007 online – hydrogen valve ready');
