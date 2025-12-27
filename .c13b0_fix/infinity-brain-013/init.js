load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 013 activates: showing skill');
  return {phase: 0.367934};
});

print('Mongoose OS Brain 013 online – hydrogen valve ready');
