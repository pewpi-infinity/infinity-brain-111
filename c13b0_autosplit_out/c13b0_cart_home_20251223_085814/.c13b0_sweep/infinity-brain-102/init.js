load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 102 activates: bad finger/touch');
  return {phase: 2.88687};
});

print('Mongoose OS Brain 102 online – hydrogen valve ready');
