revere
======

notification service

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/revere.svg)](https://npmjs.org/package/revere)
[![Downloads/week](https://img.shields.io/npm/dw/revere.svg)](https://npmjs.org/package/revere)
[![License](https://img.shields.io/npm/l/revere.svg)](https://github.com/git@github.com:jaredjj3/revere.git/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g revere
$ revere COMMAND
running command...
$ revere (-v|--version|version)
revere/1.0.2 darwin-x64 node-v14.15.4
$ revere --help [COMMAND]
USAGE
  $ revere COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`revere help [COMMAND]`](#revere-help-command)
* [`revere listen`](#revere-listen)
* [`revere listscheds [FILE]`](#revere-listscheds-file)
* [`revere notify`](#revere-notify)

## `revere help [COMMAND]`

display help for revere

```
USAGE
  $ revere help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `revere listen`

setup a listener to wait for commands

```
USAGE
  $ revere listen

OPTIONS
  -h, --help                 show CLI help
  -l, --listeners=listeners  [default: console]
  -n, --notifiers=notifiers  [default: console]
```

_See code: [src/commands/listen.ts](https://github.com/jaredjj3/revere/blob/v1.0.2/src/commands/listen.ts)_

## `revere listscheds [FILE]`

describe the command here

```
USAGE
  $ revere listscheds [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/listscheds.ts](https://github.com/jaredjj3/revere/blob/v1.0.2/src/commands/listscheds.ts)_

## `revere notify`

runs specified detectors and notifiers

```
USAGE
  $ revere notify

OPTIONS
  -d, --detectors=detectors  [default: squoze]
  -h, --help                 show CLI help
  -n, --notifiers=notifiers  [default: console]
```

_See code: [src/commands/notify.ts](https://github.com/jaredjj3/revere/blob/v1.0.2/src/commands/notify.ts)_
<!-- commandsstop -->
