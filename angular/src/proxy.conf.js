const PROXY_CONFIG = [
  {
    context: ['/app'],
    target: 'http://localhost:9015',
    secure: false,
    logLevel: 'debug'
  }
]

module.exports = PROXY_CONFIG;

