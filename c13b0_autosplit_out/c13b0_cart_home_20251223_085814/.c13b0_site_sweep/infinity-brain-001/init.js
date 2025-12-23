load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 001 activates: single');
  return {phase: 0.0283026};
});

print('Mongoose OS Brain 001 online – hydrogen valve ready');
