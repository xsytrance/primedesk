module.exports = {
  apps: [{
    name: 'primedesk',
    script: './server/index.js',
    cwd: '/home/xsyprime/primedesk',
    env: { NODE_ENV: 'production' }
  }]
};
