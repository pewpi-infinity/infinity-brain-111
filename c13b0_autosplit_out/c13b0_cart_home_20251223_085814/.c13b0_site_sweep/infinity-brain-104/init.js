load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 104 activates: understood');
  return {phase: 2.94347};
});

print('Mongoose OS Brain 104 online – hydrogen valve ready');
