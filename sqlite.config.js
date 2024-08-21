module.exports = {
  apps : [{
    name: 'diarybot-sqlite',
    script: 'sqlite.sh',
    interpreter: "bash",
    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 1,
    autorestart: true,
    exec_mode: "fork",
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      FLASK_ENV: 'production'
    },
    error_file : "./sqlite-err.log",
    out_file : "./sqlite-out.log"
  }]
};
