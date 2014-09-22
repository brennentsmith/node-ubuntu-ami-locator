#!/usr/bin/env node

var locator = require("./index.js");

var argv = require('optimist')
    .usage("Search for EC2 AMIs from Ubuntu Cloud Images (http://cloud-images.ubuntu.com/)\n\nusage: $0 --itype <itype> (--ec2 | --region <region>) [other arguments]")
    .wrap(80)
    .describe({
        'itype':    'instance-store | ebs',
        'ec2':      'auto-discover region from ec2 instance meta-data',
        'region':   'an AWS region, e.g. us-west-2 (required unless ec2)',
        'suite':    'precise | quantal | raring | etc.',
        'stream':   'server | desktop',
        'tag':      'release | daily',
        'serial':   'e.g. 20130222',
        'arch':     'amd64 | i386',
        'virttype': 'paravirtual | hvm',
        'current':  'consider only current releases',
        'multiple': 'allow multiple matches (implies --json)',
        'json':     'print full record as JSON object (or array if --multiple set). Default output is just AMI.'
    })
    .boolean('ec2', 'current', 'multiple', 'json')
    .default({
        'suite':    'precise',
        'stream':   'server',
        'tag':      'release',
        'arch':     'amd64',
        'virttype': 'paravirtual',
        'current':  true,
        'json':     false,
        'multiple': false
    })
    .demand(['itype'])
    .check(function (a) { if (!(a.region || a.ec2)) throw "either --region or --ec2 must be specified"; })
    .check(function (a) { if (a.ami && a.json) throw "only one of --ami or --json may be specified"; })
    .argv;

process.on("region", function (region) {
  argv.region = region;
  locator.query(argv)
    .on("end", function (matches) {
      if (matches.length == 0) {
        console.error("no matching AMIs found");
        process.exit(1);
      } else if (matches.length == 1 && !argv.multiple) {
        console.log("%s", argv.json ?  JSON.stringify(matches[0]) : matches[0].ami);
      } else if (argv.multiple) {
        console.log("%s", JSON.stringify(matches, null, '  '));
      } else {
        console.error("multiple matches found, try being more specific or setting --multiple");
        process.exit(1);
      }
    })
    .on('error', console.error)
});

if (argv.ec2) {
  require("ec2-instance-data").init(function (error, metadata) {
    process.emit('region', metadata.region());
  });
} else {
  process.emit("region", argv.region);
}
