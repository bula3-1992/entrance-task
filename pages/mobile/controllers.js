var fs = require('fs');
var index = fs.readFileSync('./pages/mobile/index.htm', "utf8");
var event = fs.readFileSync('./pages/mobile/event.htm', "utf8");

module.exports.index = function (req, res) {
	res.send(index);
};
module.exports.event = function (req, res) {
	res.send(event);
};
