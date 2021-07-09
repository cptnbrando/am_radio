const PROXY_CONFIG = [
  {
    context: ['/app'],
    target: 'http://18.191.81.161:9015/',
    secure: false
  }
]

module.exports = PROXY_CONFIG;

