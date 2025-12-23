load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 032 activates: don't bring up');
  return {phase: 0.905684};
});

print('Mongoose OS Brain 032 online – hydrogen valve ready');
