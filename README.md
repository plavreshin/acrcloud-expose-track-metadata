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


### Stack used

- [Apollo-server](https://www.apollographql.com/docs/apollo-server/) - GraphQL resolvers
- [Express](https://expressjs.com//) - web server
- [Fp-ts](https://gcanti.github.io/fp-ts/) - a bit of FP sugar
- [sqlite3](https://www.npmjs.com/package/sqlite) - for persistence

### Tests

There is
- single unit spec `src/service/client/arcCloudClient.spec.ts`
- single integration spec `__tests__/trackApi.integration.spec.ts`

The goal is to capture implemented resolvers snapshots as baseline hence jest snapshots are used there, see `__tests__/__snapshots__/trackApi.integration.spec.ts.snap`. 

Tests are meant to be executed with: 
```sh
npm run test or npm run test:ci
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
