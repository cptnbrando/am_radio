const PROXY_CONFIG = [
  {
    context: ['/app'],
    target: 'http://localhost:443',
    secure: false
  }
]

module.exports = PROXY_CONFIG;

