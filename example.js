var a = require('./index.js');
/*console.log(a.getAppVersionSync());
console.log(a.getAppVersionSync().version);
console.log(a.getAppVersionSync().status);
console.log(a.getAppVersionSync().build);
console.log(a.getAppVersionSync().commit);

a.getAppVersion(function(err, data) {
  console.log(data);
});*/

console.log(a.composePatternSync('M.m.p-s n-d'));

a.composePattern('M.m.p-s n-d', function(ptt) {
  console.log(ptt);
});
