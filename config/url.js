const { expressServerPaths } = require('../mock/express-server/server')

const devServerPort = 3000
const jsonServerPort = 3001
const expressServerPort = 3002

const jsonServerPaths = ['/authors', '/profile'];

module.exports = {
  devServerPort,
  jsonServerPort,
  expressServerPort,
  jsonServerPaths,
  expressServerPaths,
}
