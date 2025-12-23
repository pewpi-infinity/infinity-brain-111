load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 005 activates: he saved us (the save your money number)');
  return {phase: 0.141513};
});

print('Mongoose OS Brain 005 online – hydrogen valve ready');
