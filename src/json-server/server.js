#!/usr/bin/env node

/**
 * In order to execute correctly in any process working directory, 
 * please make sure `db.json` should be in the same directory with this script file
 */

const jsonServer = require('json-server')
const path = require('path')

// calculate the relative file path for db.json 
// from this script's process working directory 
// to where the db.json resides
const dbFileDirRelativeToPwd = path.relative(process.cwd(), __dirname)
let dbFilePathRelativeToPwd = dbFileDirRelativeToPwd.length > 0 ? (dbFileDirRelativeToPwd + '/db.json') : 'db.json'

// lanuch json server with the calculated path for db.json
const router = jsonServer.router(dbFilePathRelativeToPwd)
const middlewares = jsonServer.defaults()
const host = process.env.HOST || 'localhost'
const port = normalizePort(process.env.PORT || '3001')
const server = jsonServer.create()
server.use(middlewares)
server.use(router)
server.listen(port, () => {
  process.stdout.write(`json-server is running on http://${host}:${port}\n`)
})

// utils
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