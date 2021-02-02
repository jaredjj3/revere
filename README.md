# revere

notification service

## prerequisites

If you want to run using Docker (preferred), you will need:

- [yarn](https://classic.yarnpkg.com/en/docs/install/) or [npm](https://www.npmjs.com/get-npm) (replace `yarn` commands with `npm`)
- [docker](https://docs.docker.com/get-docker/)
- [docker-compose](https://docs.docker.com/compose/install/) (the docker-for-\* packages usually come with `docker-compose` installed)

If you want to run locally, you will need:

- [yarn](https://classic.yarnpkg.com/en/docs/install/) (please don't use `npm`)

## getting started

If running this project for the first time, run:

```bash
yarn && yarn setup
```

## commands

In order to run any command in a Docker container (preferred), run:

```bash
yarn docker cmd [COMMAND] [-f1 FLAG1...] [-f2 FLAG2...]
```

In order to run any command locally, run:

```bash
yarn cmd [COMMAND] [-f1 FLAG1...] [-f2 FLAG2...]
```

### `notify`

In order to run revere once for a given set of detectors (named `detector1` and `detector2`) and notifiers (named `notifier1` and `notifier2`), run:

```bash
yarn docker cmd notify -d detector1 -d detector2 -n notifier1 -n notifier2
```

By default, if no detectors are specified, all detectors will be run. If no notifiers are specified, only the `console` notifier is run. A list of detectors is [here](src/detectors/constants.ts) and a list of notifiers is [here](src/notifiers/constants.ts).

Environment variables are lazily fetched because not all detectors and notifiers need every environment variable to run. If an environment variable that is determined to be required is not specified, revere will throw an error with the name of the environment variable needed. Add this variable to the .env file `ENV_VAR_NAME=VALUE`.

## architecture

![architecture](https://user-images.githubusercontent.com/19232300/106395966-1cf50100-63d3-11eb-88fb-825d53e16e38.png)
