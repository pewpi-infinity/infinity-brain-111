load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 010 activates: fights');
  return {phase: 0.283026};
});

print('Mongoose OS Brain 010 online – hydrogen valve ready');
