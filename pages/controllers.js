var fs = require('fs');
var index = fs.readFileSync('./pages/index.htm', "utf8");
var event = fs.readFileSync('./pages/event.htm', "utf8");
var MobileDetect = require('mobile-detect');

module.exports.index = function (req, res) {
	var mobileDetect = new MobileDetect(req.headers["user-agent"]);
	if (mobileDetect.mobile()) {
		res.redirect('/mobile' +  req.path);
	} else {
		res.send(index);
	}
};
module.exports.event = function (req, res) {
	var mobileDetect = new MobileDetect(req.headers["user-agent"]);
	if (mobileDetect.mobile()) {
		res.redirect('/mobile' +  req.path);
	} else {
		res.send(event);
	}
};
