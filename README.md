# arcCloud metadata tracking API

# Table of Contents
0. [Prerequisites](#prerequisites)

## 0. Prerequisites

- Node v18+

## Implementation details

### GraphQL schema

Following project uses apollo-server codegen where resolvers and necessary types are generated based on single source of thruth - `src/web/schema.graphql`.

#### Query resolvers

API supports following set of query resolvers


```sh
query TrackQuery($name: String!, $artistName: String!, $id: Int!) {
  getAllTracks {
    id
    name
    artistName
  }

  getTrackByNameAndArtist(name: $name, artistName: $artistName) {
    id
    createdAt
    updatedAt
    name
    artistName
    duration
    isrc
    releaseDate
  }

  getTrackById(id: $id) {
    id
    name
    artistName
  }  
}
```

#### Mutation resolvers

API supports following set of mutation resolvers: 
```sh
mutation UpdateTrack($updateTrackId: Int!) {
  deleteTrack(id: 1)
  updateTrack(id: $updateTrackId, name: "Updated PL") {
    name
  }
}

```

#### Sample request to GraphQL API

GraphQL API is up and running at localhost:9000/graphql, example query: 

```sh
curl --request POST \
  --url http://localhost:9000/graphql \
  --header 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVtYWlsIiwiaWF0IjoxNzA0MzE5Mzc4LCJleHAiOjE3MDQ5MjQxNzh9.dRysG06R1NIWMiF90hn6Twlid-wmV1zIQdLGDeFUlTE' \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.5.1' \
  --data '{"query":"query TrackQuery {\n\tgetTrackByNameAndArtist(name: \"Summer\", artistName: \"Calvin Harris\") {\n\t\tid\n\t\tcreatedAt\n\t\tupdatedAt\n\t\tname\n\t\tartistName\n\t\tduration\n\t\tisrc\n\t\treleaseDate\n\t}\n}\n","operationName":"TrackQuery"}'
```

### High-level overview

This is a sample implementation of an ACRCloud client and GrapQL API that offers music tracks lookup by artist and track name. 
The implementation follows Apollo team guidelines to implement GraphQL API as well as uses codegen to produce valid types and resolvers. 


### Stack used

- [Apollo-server](https://www.apollographql.com/docs/apollo-server/) - GraphQL resolvers
- [Express](https://expressjs.com//) - web server
- [Fp-ts](https://gcanti.github.io/fp-ts/) - a bit of FP sugar
- [sqlite3](https://www.npmjs.com/package/sqlite) - for persistence

### Tests

There is
- single unit spec `src/service/client/arcCloudClient.spec.ts`
- single integration spec `__tests__/trackApi.integration.spec.ts`
- single e2e spec `e2e/trackApi.e2e.spec.ts`

The goal is to capture implemented resolvers snapshots as baseline hence jest snapshots are used there, see `__tests__/__snapshots__/trackApi.integration.spec.ts.snap`. 

Tests are meant to be executed with: 
```sh
npm run test or npm run test:ci
```

#### e2e tests 

e2e tests can be started using `npm run test:e2e` command, which shall yield
```
[WebServer] Listening on port 9000
  pw:webserver HTTP GET: http://127.0.0.1:9000/_healthcheck +1s
  pw:webserver HTTP Status: 200 +12ms
  pw:webserver WebServer available +1ms

Running 1 test using 1 worker

  ✓  1 [chromium] › trackApi.e2e.spec.ts:4:1 › get tracks by for Calvin Harris (56ms)
[WebServer] 2024-01-05T08:58:00.532Z [info]: getTrackByNameAndArtist: name: Summer artistName: Calvin Harris
[WebServer] POST /graphql 200 12.119 ms - 464
[
  {
    id: 2,
    createdAt: '2024-01-05T08:40:16.104Z',
    updatedAt: '2024-01-05T08:40:16.104Z',
    name: 'Summer',
    artistName: 'Calvin Harris',
    duration: 222533,
    isrc: 'GBARL1400296',
    releaseDate: '2014-10-31'
  },
  {
    id: 3,
    createdAt: '2024-01-05T08:40:16.104Z',
    updatedAt: '2024-01-05T08:40:16.104Z',
    name: 'Summer - Diplo & Grandtheft Remix',
    artistName: 'Calvin Harris',
    duration: 267253,
    isrc: 'GBARL1400811',
    releaseDate: '2014-06-20'
  }
]

  1 passed (2.3s)
```

## Running locally

This project has only in-memory dependencies, feel free to copy `.env.dist` to `.env` and add values there

To start application in development mode run:

```sh
npm run start:dev
```

To apply all eslint + prettier rules, run: 
```sh
npm run all:dev
```

To apply GraphQL schema changes, run 
```sh
npm run generate
```

### Project tree

Following is the project structure/tree layout:

```sh
tracks-search-graphql-task
├── .env
├── .env.dist
├── .eslintignore
├── .eslintrc.json
├── .prettierrc
├── Dockerfile
├── README.md
├── __tests__
│   ├── __snapshots__
│   │   └── trackApi.integration.spec.ts.snap
│   └── trackApi.integration.spec.ts
├── codegen.yml
├── jest.config.js
├── migrations
│   ├── 001_initial_tables.sql
│   └── 002_seed_data.sql
├── nodemon.json
├── package-lock.json
├── package.json
├── src
│   ├── app.ts
│   ├── common
│   │   └── logger.ts
│   ├── db
│   │   └── trackRepository.ts
│   ├── domain
│   │   └── track.ts
│   ├── environment.d.ts
│   ├── gracefulShutdown.ts
│   ├── server.ts
│   ├── service
│   │   ├── client
│   │   │   ├── arcCloudClient.spec.ts
│   │   │   └── arcCloudClient.ts
│   │   └── track
│   │       └── trackService.ts
│   ├── types
│   │   ├── configuration.ts
│   │   ├── context.ts
│   │   ├── index.d.ts
│   │   └── validation.ts
│   ├── web
│   │   ├── __generated__
│   │   │   └── resolvers-types.ts
│   │   ├── resolvers
│   │   │   ├── mutations.ts
│   │   │   ├── trackMutations.ts
│   │   │   └── trackQueries.ts
│   │   └── schema.graphql
│   └── wiring
│       ├── persistence.ts
│       ├── routes.ts
│       └── services.ts
└── tsconfig.json

```
