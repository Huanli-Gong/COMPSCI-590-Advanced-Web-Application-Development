# What's different

## Redis

You need a Redis server, which you can conveniently get via Docker (https://hub.docker.com/_/redis):

```bash
docker run --rm -d --name redis -p 6379:6379 redis
```

Yes, Socket.IO technically supports using Mongo as a backend, but it requires you to set up a replica set, and it is, in short, more trouble than it's worth.

`server/redis.ts` implements the instructions here: https://socket.io/docs/v4/redis-adapter/#with-the-ioredis-package.

## Changing the game state from being a global variable

For scale out to work, game state must be in a database, not a global variable. The code has been changed to use optimistic concurrency and a versioning scheme. The game state is stored in Mongo using a unique `_id`. **This means you do need a running Mongo server on localhost:27017.**

# How to run

You'll need (at least) 4 terminal windows to see this work. When done, see the scale out in action by opening player #1's screen at http://localhost:8100/0 and player #2's screen at http://localhost:8102/1.

## Terminal 1 - server #1 running on port 8101

```bash
cd server
SERVER_PORT=8101 npm start
```

## Terminal 2 - UI frontend #1 running on port 8100 using backend #1 on port 8101

```bash
cd ui
SERVER_PORT=8101 UI_PORT=8100 npm run dev
```

## Terminal 3 - server #2 running on port 8103

```bash
cd server
SERVER_PORT=8103 npm start
```

## Terminal 4 - UI frontend #2 running on port 8102 using backend #2 on port 8103

```bash
cd ui
SERVER_PORT=8103 UI_PORT=8102 npm run dev
```


