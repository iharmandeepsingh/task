export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || 'postgresql://ctu_user:ctu_password@localhost:5432/ctu_task_db?schema=public',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me_in_prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me_in_prod',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY || 'dev_fcm_key_placeholder',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    bucket: process.env.S3_BUCKET || 'ctu-task-attachments',
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  businessRules: {
    idleThresholdDays: parseInt(process.env.IDLE_THRESHOLD_DAYS || '3', 10),
    reminderFrequencyDays: parseInt(process.env.REMINDER_FREQUENCY_DAYS || '3', 10),
    reminderWindowStartDays: parseInt(process.env.REMINDER_WINDOW_START_DAYS || '30', 10),
    reminderWindowEndDays: parseInt(process.env.REMINDER_WINDOW_END_DAYS || '15', 10),
  },
});
