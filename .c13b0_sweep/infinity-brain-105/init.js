load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 105 activates: listen to someone else');
  return {phase: 2.97177};
});

print('Mongoose OS Brain 105 online – hydrogen valve ready');
