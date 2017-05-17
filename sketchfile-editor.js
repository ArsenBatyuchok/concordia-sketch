const path = require('path');
const fs = require('fs');
const JSZip = require('jszip')
const mime = require('mime');

module.exports = function (params, res) {
  fs.readFile('blank.sketch', (err, data) => {
    if(err) throw err;
    JSZip.loadAsync(data).then(function(zip) {
      // zip contains a json file that describes all the directory & files in the zip file

      // read the top level page
      const pagePath = Object.keys(zip.files)[1];

      zip.file(pagePath)
        .async('string')
        .then(function(str) {
          const newFileName = generateRandomFileName();
          const json = JSON.parse(str);
          const layout = json.layers[0].layout;
          const artboardWidth = json.layers[0].frame.width;

          layout.rowHeightMultiplication = 1;
          layout.guttersOutside = false;
          layout.totalWidth = params.width;
          layout.gutterHeight = params.baseline;
          layout.numberOfColumns = params.numberOfColumns;
          layout.gutterWidth = params.gutter;
          layout.horizontalOffset = (artboardWidth - layout.totalWidth) / 2;
          layout.columnWidth = (layout.totalWidth - (layout.gutterWidth*(layout.numberOfColumns - 1)))/layout.numberOfColumns;

          // write the page json back to the file in the zip
          zip.file(pagePath, JSON.stringify(json));

          // override the original file
          zip.generateNodeStream({ type:'nodebuffer', streamFiles:true })
            .pipe(fs.createWriteStream(__dirname + '/' + newFileName + '.sketch'))
            .on('finish', () => {
              const file = __dirname + '/' + newFileName + '.sketch';
              const mimetype = mime.lookup(file);

              res.setHeader('Content-disposition', 'attachment; filename=' + newFileName + '.sketch');
              res.setHeader('Content-type', mimetype);

              const filestream = fs.createReadStream(file);
              filestream.pipe(res);
              res.once("finish", function () {
                deleteFile(file);
              });
            });
        });
    });
  });
};

function generateRandomFileName() {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";

  for (let i=0; i<10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function deleteFile(file) {
  fs.unlink(file, function (err) {
    if (err) {
      logger.error(err);
    }
  });
}
