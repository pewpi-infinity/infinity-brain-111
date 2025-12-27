load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 101 activates: learning');
  return {phase: 2.85856};
});

print('Mongoose OS Brain 101 online – hydrogen valve ready');
