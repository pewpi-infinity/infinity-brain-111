load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 015 activates: family');
  return {phase: 0.424539};
});

print('Mongoose OS Brain 015 online – hydrogen valve ready');
