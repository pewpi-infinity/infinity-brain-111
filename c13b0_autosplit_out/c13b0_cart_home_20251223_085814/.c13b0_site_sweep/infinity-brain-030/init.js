load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 030 activates: reading my mind');
  return {phase: 0.849078};
});

print('Mongoose OS Brain 030 online – hydrogen valve ready');
