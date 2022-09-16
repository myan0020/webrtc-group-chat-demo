const devServerPort = 3000
const jsonServerPort = 3001
const expressServerPort = 3002
const webSocketServerPort = 3003

const jsonServerPaths = ['/authors', '/profile'];
const expressServerPaths = ['/hello', '/world', '/author', '/video', '/login', '/logout'];

module.exports = {
  devServerPort,
  jsonServerPort,
  expressServerPort,
  webSocketServerPort,
  jsonServerPaths,
  expressServerPaths,
}
