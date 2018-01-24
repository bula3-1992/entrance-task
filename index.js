const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const pagesRoutes = require('./pages/routes');
const pagesMobileRoutes = require('./pages/mobile/routes');
const graphqlRoutes = require('./graphql/routes');

const app = express();

app.use(bodyParser.json());

app.use('/', pagesRoutes);
app.use('/mobile', pagesMobileRoutes);
app.use('/graphql', graphqlRoutes);
app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(3000, () => console.log('Express app listening on localhost:3000'));
module.exports = server;