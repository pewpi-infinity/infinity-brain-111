load('api_rpc.js');
load('api_shadow.js');

RPC.addHandler('Reveal', function() {
  print('Node 028 activates: evil no good number');
  return {phase: 0.792473};
});

print('Mongoose OS Brain 028 online – hydrogen valve ready');
