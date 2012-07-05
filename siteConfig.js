var siteConfig = {
  'uri': 'http://localhost:5000', // Without trailing /
  'packAssets': false
};

if (process.env.NODE_ENV == 'production') {
  siteConfig.uri = 'http://hatchetapp.net';
  siteConfig.packAssets = true;
}

module.exports = siteConfig;