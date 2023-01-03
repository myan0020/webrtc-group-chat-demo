const devServerPort = 3000
// const expressServerPort = 3002
const expressServerPort = 443;

const expressServerPaths = ['/api/login', '/api/logout', '/api/rooms'];

module.exports = {
  devServerPort,
  expressServerPort,
  expressServerPaths,
}
