load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 006 activates: has your back');
  return {phase: 0.169816};
});

print('Mongoose OS Brain 006 online – hydrogen valve ready');
