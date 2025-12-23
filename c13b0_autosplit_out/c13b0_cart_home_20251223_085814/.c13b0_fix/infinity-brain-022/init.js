load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 022 activates: backfire');
  return {phase: 0.622657};
});

print('Mongoose OS Brain 022 online – hydrogen valve ready');
