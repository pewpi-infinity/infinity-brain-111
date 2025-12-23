load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 103 activates: reading minds');
  return {phase: 2.91517};
});

print('Mongoose OS Brain 103 online – hydrogen valve ready');
