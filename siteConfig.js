var siteConfig = {
  'uri': 'http://localhost:5000' // Without trailing /
};

if (process.env.NODE_ENV == 'production') {
  siteConfig.uri = 'http://hat.jit.su';
}

module.exports = siteConfig;