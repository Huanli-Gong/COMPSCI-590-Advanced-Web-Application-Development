# Build Docker images

## Server
```bash
cd server
docker build -t lecture17-signup-list-server .
cd ..
```

## UI (NGINX)
```bash
cd ui
docker build -t lecture17-signup-list-ui .
cd ..
```

## Load Balancer (NGINX)
```bash
cd load-balancer
docker build -t lecture17-signup-list-load-balancer .
cd ..
```

# Run Docker containers

```bash
docker run -d --rm --name server1 lecture17-signup-list-server
docker run -d --rm --name ui1 lecture17-signup-list-ui
docker run -it --rm --link ui1:ui1 --link server1:server1 -p 8080:80 lecture17-signup-list-load-balancer
```
