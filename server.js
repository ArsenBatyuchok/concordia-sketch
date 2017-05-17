const express = require('express');
const app = express();
const api = require('./api');

app.set('port', (process.env.PORT || 8080));

api(app);

app.listen(app.get('port'), function() {
    console.log('Server started: ' + app.get('port') + '/');
});
