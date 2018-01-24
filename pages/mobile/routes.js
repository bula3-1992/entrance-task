const express = require('express');

const router = express.Router();
const { index, event } = require('./controllers');

router.get('/', index);
router.get('/success*', index);
router.get('/event*', event);

module.exports = router;
