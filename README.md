# Bitcoin SGP

**SGP-BTC** unleashes the power of Bitcoin! 

Combining a non-collusive MPC network with a Zero Knowledge Appchain powered by Mina [Protokit](https://protokit.dev), SGP-BTC proivdes an access to pure Bitcoin with [Zero Trust](https://en.wikipedia.org/wiki/Zero_trust_security_model) Architecture.

*Zero Trust* describes an approach to the strategy, design and implementation of IT systems. The main concept behind the zero trust security model is "never trust, always verify", which means that users and devices should not be trusted by default, even if they are connected to a permissioned network such as a corporate LAN and even if they were previously verified.

## Hackathon Demo

* [**Problem statement, User Journey and Presentation**](https://hackmd.io/@robert-zaremba/SyAVLk6aC)
* Demonstration of using the MPC wallet secured by ZK Rollup:
  * [Linea Marketplace and bridge contract](https://github.com/gonative-cc/sgp-btc-evm/tree/master/solidity)
  * [Marketplace UI](https://github.com/gonative-cc/sgp-btc-evm/tree/master/UI)
  * [Bridge UI] -> `apps/web`

## Quick start

The monorepo contains 1 package and 1 app:

- `packages/chain` contains everything related to your app-chain
- `apps/web` contains a demo UI for a Bridge

**Prerequisites:**

- Node.js `v18` (we recommend using NVM)
- pnpm `v9.8`
- nvm

For running with persistance / deploying on a server
- docker `>= 24.0`
- docker-compose `>= 2.22.0`

## Setup

```zsh
pnpm install
```

## Running

We use Protokit starter kit that offers 3 environmnets to run the appchain. Check the starter-kit for more details.

### Running in-memory

```zsh
# starts both UI and sequencer locally
pnpm env:inmemory dev

# starts UI only
pnpm env:inmemory dev --filter web
# starts sequencer only
pnpm env:inmemory dev --filter chain
```

> Be aware, the dev command will automatically restart your application when your sources change. 
> If you don't want that, you can alternatively use `pnpm run build` and `pnpm run start`

Navigate to `localhost:3000` to see the example UI, or to `localhost:8080/graphql` to see the GQL interface of the locally running sequencer.

### Running tests
```zsh
# run and watch tests for the `chain` package
pnpm run test --filter=chain -- --watchAll
```

### Running with persistence

```zsh
# start databases
pnpm env:development docker:up -d
# generate prisma client
pnpm env:development prisma:generate
# migrate database schema
pnpm env:development prisma:migrate

# build & start sequencer, make sure to prisma:generate & migrate before
pnpm build --filter=chain
pnpm env:development start --filter=chain

# Watch sequencer for local filesystem changes
# Be aware: Flags like --prune won't work with 'dev'
pnpm env:development dev --filter=chain

# Start the UI
pnpm env:development dev --filter web
```

#### Configuration

Go to `docker/proxy/Caddyfile` and replace the `*` matcher with your domain.
```
yourdomain.com {
    ...
}
```

> HTTPS is handled automatically by Caddy, you can (learn more about automatic https here.)[https://caddyserver.com/docs/automatic-https]

In most cases, you will need to change the `NEXT_PUBLIC_PROTOKIT_GRAPHQL_URL` property in the `.env` file to the domain your graphql endpoint is running in.
By default, the graphql endpoint is running on the same domain as your UI with the `/graphql` suffix.

#### Running sovereign chain locally

The caddy reverse-proxy automatically uses https for all connections, use this guide to remove certificate errors when accessing localhost sites

<https://caddyserver.com/docs/running#local-https-with-docker>


## CLI Options

- `logLevel`: Overrides the loglevel used. Also configurable via the `PROTOKIT_LOG_LEVEL` environment variable.
- `pruneOnStartup`: If set, prunes the database before startup, so that your chain is starting from a clean, genesis state. Alias for environment variable `PROTOKIT_PRUNE_ON_STARTUP`

In order to pass in those CLI option, add it at the end of your command like this

`pnpm env:inmemory dev --filter chain -- --logLevel DEBUG --pruneOnStartup`

### Building the framework from source

1. Make sure the framework is located under ../framework from the starter-kit's location
2. Adapt your starter-kit's package.json to use the file:// references to framework
3. Go into the framework folder, and build a docker image containing the sources with `docker build -f ./packages/deployment/docker/development-base/Dockerfile -t protokit-base .`

4. Comment out the first line of docker/base/Dockerfile to use protokit-base
