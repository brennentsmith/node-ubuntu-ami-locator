# ubuntu-ami-locator

Locate "official" Ubuntu AMI from javascript or the command line.  This
is based on the same data source as the [Amazon EC2 AMI Locator](http://cloud-images.ubuntu.com/locator/ec2/).
Inspired by Scott Moser's [How to find the right Ubuntu AMI on EC2](http://ubuntu-smoser.blogspot.com/2011/07/how-to-find-right-ubuntu-ami-on-ec2.html)

Note that if all you need is the command line tool (and you are already on
ubuntu), you can use the `ubuntu-cloudimg-query` command in the
[`cloud-utils`](https://launchpad.net/ubuntu/+source/cloud-utils) package.

## Install

```bash
    npm install ubuntu-ami-locator
```

## Example

From code

```javascript
var locator = require("ubuntu-ami-locator");

locator.query({
    itype: "ebs",
    region: "us-west-2",
    suite: "precise",
    stream: "server",
    tag: "release",
    arch: "amd64",
    virttype: "paravirtual"
  }).on("end", function (data) {
      console.log(JSON.stringify(data));
  }).on("error", function (error) {
      console.error(error);
      process.exit(1);
  });
```

```JSON
{
  "ami":"ami-4ad94c7a",
  "aki":"aki-fc37bacc",
  "serial":"20130222",
  ...
}
```

From command line (leverages some defaults)

```bash
$ ubuntu-ami-locator --itype ebs --region us-west-2 
ami-4ad94c7a
```

## Command Line Usage

```
usage: node ./ubuntu-ami-locator --itype <itype> (--ec2 | --region <region>) [other arguments]

Options:
  --itype     instance-store | ebs                                    [required]
  --ec2       auto-discover region from ec2 instance meta-data         [boolean]
  --region    an AWS region, e.g. us-west-2 (required unless ec2)               
  --suite     precise | quantal | raring | etc.             [default: "precise"]
  --stream    server | desktop                               [default: "server"]
  --tag       release | daily                               [default: "release"]
  --serial    e.g. 20130222                                                     
  --arch      amd64 | i386                                    [default: "amd64"]
  --virttype  paravirtual | hvm                         [default: "paravirtual"]
  --current   consider only current releases          [boolean]  [default: true]
  --multiple  allow multiple matches (implies --json)
                                                     [boolean]  [default: false]
  --json      print full record as JSON object (or array if --multiple set).
              Default output is just AMI.            [boolean]  [default: false]
```

## License

MIT
