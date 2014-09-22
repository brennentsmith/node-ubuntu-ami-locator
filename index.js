var https = require("https");
var csv = require("csv");
var EventEmitter = require("events").EventEmitter;

var csv_options = {
  delimiter: "\t",
  // NOTE: column names aren't present  in the query files so these are cribbed from
  // http://bazaar.launchpad.net/~ubuntu-on-ec2/vmbuilder/ami-finder/view/head:/gen-table.sh
  // _dummy column in place because virttype consistently preceded by two tabs
  columns: "suite stream tag serial itype arch region ami aki _dummy virttype".split(" ")
};

var self = module.exports = new EventEmitter();

self.query = function (params) {

  // Query URLs resolve to text files and are built like so:
  // https://cloud-images.ubuntu.com/query/<suite>/<stream>/<query_file>
  // E.g.
  // https://cloud-images.ubuntu.com/query/precise/server/released.current.txt

  var query_file = (params.tag == 'release' ? 'released' : params.tag) + (params.current ? '.current' : '') + '.txt';
  var query_url = {
     host: 'cloud-images.ubuntu.com',
     path: ['/query', params.suite, params.stream, query_file].join('/')
  };

  var matches = [];

  https.get(query_url, function (res) {
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) { data += chunk; });
    res.on('end', function () {
      csv()
        .from(data, csv_options)
        .transform(function (record, index) {
          delete record._dummy;
          var match = true;
          for (var key in params) {
            if (key in record && params[key] !== record[key]) {
              match = false;
              break;
            }
          }
          if (match) matches.push(record);
        }).on('end', function () {
          self.emit('end', matches);
        });
    });
  }).on('error', self.emit.bind(self, 'error'))

  return self; // for ease in chaining stuff
};
