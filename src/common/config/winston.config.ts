import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as os from 'os';

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf((info) => {
          // Destructuring for type safety
          const { timestamp, level, message, context, ...meta } = info;

          // Enforce string format to avoid template literal errors
          const ts =
            typeof timestamp === 'string'
              ? timestamp
              : new Date().toISOString();
          const ctx = typeof context === 'string' ? context : 'Context : NULL';
          const msg =
            typeof message === 'string' ? message : JSON.stringify(message);
          const metaString = Object.keys(meta).length
            ? `${JSON.stringify(meta)}`
            : '';

          return `[ NexuS - API ] - ${ts} [ ${level} ] [ ${ctx} ] - ${msg} - ${metaString}`;
        }),
      ),
    }),

    new winston.transports.DailyRotateFile({
      filename: 'logs/NexuS-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};

// Gather system metadata
export const getSystemMetaData = () => ({
  hostname: os.hostname(),
  platform: os.platform(),
  cpuUsage: os.loadavg()[0],
  freemem: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
  timestamp: new Date().toISOString(),
});
