/**
 * PM2: frontend (5173) + backend (3000, API only).
 * Uso: pm2 start ecosystem.config.cjs
 * Base URL: http://efef79cc-0938-42cc-8a5a-43020deccf0c.clouding.host
 */

const path = require('path');
const rootDir = path.join(__dirname);

module.exports = {
  apps: [
    {
      name: 'memecards-backend',
      script: 'server/dist/index.js',
      cwd: rootDir,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_ONLY: 'true',
        PAGES_DIR: './server/pages-data',
        IMAGES_DIR: './server/images',
        UPLOAD_DIR: './server/uploads',
        PROCESSED_DIR: './server/processed',
      },
      merge_logs: true,
      time: true,
    },
    {
      name: 'memecards-frontend',
      script: 'npm',
      args: ['run', 'preview:prod'],
      cwd: rootDir,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
      merge_logs: true,
      time: true,
    },
  ],
};
