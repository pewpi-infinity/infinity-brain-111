load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 097 activates: cop');
  return {phase: 2.74535};
});

print('Mongoose OS Brain 097 online – hydrogen valve ready');
