var fs = require('fs');
var file = fs.readFileSync('./pages/index.htm', "utf8");
module.exports.index = function (req, res) {
  res.send(file);
};
