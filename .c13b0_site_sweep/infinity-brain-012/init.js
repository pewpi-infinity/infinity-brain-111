load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 012 activates: torture');
  return {phase: 0.339631};
});

print('Mongoose OS Brain 012 online – hydrogen valve ready');
