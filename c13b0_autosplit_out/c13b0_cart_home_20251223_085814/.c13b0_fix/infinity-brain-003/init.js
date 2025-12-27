load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 003 activates: married with kids');
  return {phase: 0.0849078};
});

print('Mongoose OS Brain 003 online – hydrogen valve ready');
