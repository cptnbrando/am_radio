const PROXY_CONFIG = [
  {
    context: ['/app'],
    target: 'http://localhost:4200/app',
    secure: false
  }
]

module.exports = PROXY_CONFIG;

