# Prerequisites

* Running Mongo server -- either via Docker:

```bash
docker run --rm -d -p 27017:27017 --name mongo mongo
```

or, if you have one already running in Kubernetes:

```bash
kubectl port-forward service/db 27017:27017
```

You also need a `server/secrets.ts` file and the redirect URI (http://127.0.0.1:8192/api/login-callback) registered in GitLab.

NOTE: if you are having problems with 127.0.0.1, as is usually the case with WSL, change the URL above to use localhost instead, and run your server this way:

```bash
cd server
HOST=localhost npm start
```

# RBAC in server API implementations

Whether a user is an operator or a customer is no longer determined by the customers and operators collections in Mongo. Rather, it is determined by GitLab group membership. Set the `OPERATOR_GROUP_ID` variable accordingly in `server.ts`.

To test this out on your own, first set `OPERATOR_GROUP_ID` to an empty string, so that you can log in as a customer. Submit an order. Then, change `OPERATOR_GROUP_ID` to a GitLab group you are a member of. Refresh the page, and you should have access to operator functions.

# RBAC in frontend UI

The frontend is accessed at `http://localhost:8192/`. Rather than `/customer/<<customer ID>>` and `/operator/<<operator ID>>` paths, everything is accessed via `/customer` / `/operator` routes, respectively, accessible via the top navigation bar. This is because the navigation bar dynamically adjusts based on the role membership of the logged in user. 

# Disable security

To run this version from a headless E2E test, use the following alternate command to start the server:

```bash
cd server
DISABLE_SECURITY=foo-bar-baz npm start
```

Once doing this, navigate to http://localhost:8192/api/login?key=foo-bar-baz&user=<<user ID>>&role=<<either operator or customer>>.
