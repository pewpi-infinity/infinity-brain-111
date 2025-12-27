load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 029 activates: not wanting to pay me 92%');
  return {phase: 0.820776};
});

print('Mongoose OS Brain 029 online – hydrogen valve ready');
