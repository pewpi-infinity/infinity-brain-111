load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 004 activates: Hollywood');
  return {phase: 0.11321};
});

print('Mongoose OS Brain 004 online – hydrogen valve ready');
