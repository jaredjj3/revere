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
revere/1.1.0 darwin-x64 node-v14.3.0
$ revere --help [COMMAND]
USAGE
  $ revere COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`revere echo STRING`](#revere-echo-string)
* [`revere help [COMMAND]`](#revere-help-command)
* [`revere jobs OPERATION`](#revere-jobs-operation)
* [`revere notify`](#revere-notify)
* [`revere test [FILE]`](#revere-test-file)

## `revere echo STRING`

prints the arguments to stdout

```
USAGE
  $ revere echo STRING

OPTIONS
  -h, --help                 show CLI help
  -n, --notifiers=notifiers  [default: console]
```

_See code: [src/commands/echo.ts](https://github.com/jaredjj3/revere/blob/v1.1.0/src/commands/echo.ts)_

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

## `revere jobs OPERATION`

list, create, update, and show jobs

```
USAGE
  $ revere jobs OPERATION

OPTIONS
  -h, --help                       show CLI help
  -n, --notifiers=notifiers        [default: console]
  --active=true|false
  --command=command
  --cronExpression=cronExpression
  --description=description
  --name=name
```

_See code: [src/commands/jobs.ts](https://github.com/jaredjj3/revere/blob/v1.1.0/src/commands/jobs.ts)_

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

_See code: [src/commands/notify.ts](https://github.com/jaredjj3/revere/blob/v1.1.0/src/commands/notify.ts)_

## `revere test [FILE]`

describe the command here

```
USAGE
  $ revere test [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/test.ts](https://github.com/jaredjj3/revere/blob/v1.1.0/src/commands/test.ts)_
<!-- commandsstop -->
