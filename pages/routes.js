const express = require('express');

const router = express.Router({strict: true});
const { index, event } = require('./controllers');

router.get('/', index);
router.get('/success*', index);
router.get('/event*', event);
router.get('/mobile', function (req, res) {
	res.redirect('/mobile/');
});

module.exports = router;
