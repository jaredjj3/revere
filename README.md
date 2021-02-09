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
revere/1.2.0 darwin-x64 node-v14.15.4
$ revere --help [COMMAND]
USAGE
  $ revere COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`revere cronstr CRON EXPRESSION`](#revere-cronstr-cron-expression)
* [`revere echo STRING`](#revere-echo-string)
* [`revere help [COMMAND]`](#revere-help-command)
* [`revere jobs:list`](#revere-jobslist)
* [`revere notify`](#revere-notify)
* [`revere runs:list`](#revere-runslist)
* [`revere yfin:info`](#revere-yfininfo)

## `revere cronstr CRON EXPRESSION`

show the human readable version of a cron expression

```
USAGE
  $ revere cronstr CRON EXPRESSION

OPTIONS
  -h, --help                 show CLI help
  -n, --notifiers=notifiers  [default: console]
```

_See code: [src/oclif/commands/cronstr.ts](https://github.com/jaredjj3/revere/blob/v1.2.0/src/oclif/commands/cronstr.ts)_

## `revere echo STRING`

prints the arguments to stdout

```
USAGE
  $ revere echo STRING

OPTIONS
  -h, --help                 show CLI help
  -n, --notifiers=notifiers  [default: console]
```

_See code: [src/oclif/commands/echo.ts](https://github.com/jaredjj3/revere/blob/v1.2.0/src/oclif/commands/echo.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `revere jobs:list`

list jobs

```
USAGE
  $ revere jobs:list

OPTIONS
  -h, --help                 show CLI help
  -n, --notifiers=notifiers  [default: console]
  --active=true|false
```

_See code: [src/oclif/commands/jobs/list.ts](https://github.com/jaredjj3/revere/blob/v1.2.0/src/oclif/commands/jobs/list.ts)_

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

_See code: [src/oclif/commands/notify.ts](https://github.com/jaredjj3/revere/blob/v1.2.0/src/oclif/commands/notify.ts)_

## `revere runs:list`

list command runs

```
USAGE
  $ revere runs:list

OPTIONS
  -h, --help             show CLI help
  -l, --limit=limit      [default: 10]
  --notifiers=notifiers  [default: console]
```

_See code: [src/oclif/commands/runs/list.ts](https://github.com/jaredjj3/revere/blob/v1.2.0/src/oclif/commands/runs/list.ts)_

## `revere yfin:info`

get basic info from the api

```
USAGE
  $ revere yfin:info

OPTIONS
  -f, --fields=fields
  -h, --help                 show CLI help
  -n, --notifiers=notifiers  [default: console]
  -s, --symbols=symbols      (required)
```

_See code: [src/oclif/commands/yfin/info.ts](https://github.com/jaredjj3/revere/blob/v1.2.0/src/oclif/commands/yfin/info.ts)_
<!-- commandsstop -->
