# Game of Set

## Kubernetes Commands:

```bash
docker desktop: setting -> Kubernetes -> enable Kubernetes
server/: docker build -t game-of-set-server .
ui/: docker build -t game-of-set-ui .
kubectl create -f k8s/
kubectl port-forward service/db 27017:27017
kubectl port-forward service/redis 6379:6379
kubectl scale deployment.apps/server --replicas=20
# after everything is done
kubectl delete -f k8s/
```

```bash
curl -X GET "http://localhost:31000/api/player-info" -i
curl -X GET "http://localhost:31000/api/player-history" -i
curl -X PUT "http://localhost:31000/api/update-player-info" \
     -H "Content-Type: application/json" \
    -d '{
        "name": "<script>alert('XSS');</script>",
        "nickname": "testuser",
        "email": "test@example.com",
        "preferredLevel": 1
    }' -i
```
localhost:31000/api/login?key=alpha&user=yl967&role=advancedPlayer
localhost:31000/api/login?key=alpha&user=hg163&role=advancedPlayer