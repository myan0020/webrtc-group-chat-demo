#!/usr/bin/env node

const jsonServer = require('json-server')

const server = jsonServer.create()
const router = jsonServer.router('./src/json-server/db.json')
const middlewares = jsonServer.defaults()

const host = process.env.HOST || 'localhost'
const port = normalizePort(process.env.PORT || '3001')

server.use(middlewares)
server.use(router)
server.listen(port, () => {
  process.stdout.write(`json-server is running on http://${host}:${port}\n`)
})

/**
 * utils
 */
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}