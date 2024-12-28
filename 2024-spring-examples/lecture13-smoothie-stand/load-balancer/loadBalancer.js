// based on https://medium.com/@ali.5991.jalali/create-your-proxy-server-and-load-balancer-using-node-js-b77d3a69a742

const http = require('http')
const proxy = require('http-proxy')

const proxyServer = proxy.createProxyServer()
const targets = [
  { url: 'http://127.0.0.1:8132', available: false },
  { url: 'http://127.0.0.1:8133', available: false },
  { url: 'http://127.0.0.1:8134', available: false },
  { url: 'http://127.0.0.1:8135', available: false },
]
const port = parseInt(process.env.PORT) || 8131

setInterval(async () => {
  for (let i = 0; i < targets.length; i++) {
    try {
      await fetch(targets[i].url, { signal: AbortSignal.timeout(1000) })
      if (!targets[i].available) {
        console.log(`${targets[i].url} available`)
      }
      targets[i].available = true
    } catch (e) {
      if (targets[i].available) {
        targets[i].available = false
        console.log(`${targets[i].url} unavailable`)
      }
    }
  }
}, 1000)

http.createServer((req, res) => {
  const activeTargets = targets.filter(t => t.available)
  if (activeTargets.length === 0) {
    res.writeHead(503 /* unavailable */, { "Content-Type": "text/plain" })
    res.write("No targets available!")
    res.end()
    return
  }

  const target = activeTargets[(Math.floor(Math.random() * activeTargets.length))].url
  console.log(`${req.url} -> ${target}`)
  proxyServer.web(req, res, { target })
}).listen(port, () => { console.log(`Load balancer running on port ${port}`) })
