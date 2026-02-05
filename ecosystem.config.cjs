/**
 * PM2 ecosystem file - MemeCards server
 * Uso: pm2 start ecosystem.config.cjs
 *      pm2 start ecosystem.config.cjs --only memecards-server
 */

module.exports = {
  apps: [
    {
      name: 'memecards-server',
      script: 'server/dist/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
      merge_logs: true,
      time: true,
    },
  ],
};
