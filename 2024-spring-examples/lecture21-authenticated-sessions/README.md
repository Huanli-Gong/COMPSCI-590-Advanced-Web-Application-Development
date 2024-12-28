# Standalone server: see sessions in action

```bash
cd server
npm i
npm start
```

Then go to http://127.0.0.1:8210/ in your browser.

# Malicious site

While the standalone server started above is still running, run the following commands in a separate terminal:

```bash
cd malicious-server
npm i
npm start
```

Then go to http://127.0.0.1:8219/ in your browser.

# Load balancing

Before following these steps, you will need to stop the standalone server.

## Set up connection to Mongo

The server uses an in-memory session store by default. You will need to uncomment the code in `server/server.ts` that starts with `store: MongoStore`...

Additionally, you will need access to a MongoDB server. If you still have the Lecture 19 Kubernetes environment running, you can set up a proxy to that example's Mongo:

```bash
kubectl port-forward service/db 27017:27017
```

## Start 3 copies of the server

```bash
cd server
npm run 3-servers
```

## Start load balancer

In a separate terminal:

```bash
cd load-balancer
npm i
npm start
```

Then go to http://127.0.0.1:8210/ in your browser.