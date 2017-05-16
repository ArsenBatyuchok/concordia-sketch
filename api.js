var sketchfileEditor = require('./sketchfile-editor');

module.exports = function (app) {
  app.get('/api/:width/:ratio/:baseline/:numberOfColumns/:gutter', function (req, res) {
    sketchfileEditor(req.params, res);
  });
}
