const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, colorize, errors } = format;

// Custom format for development
const devFormat = printf(({ level, message, timestamp, stack, filename, line, ...metadata }) => {
  let output = `[${timestamp}] ${level}`;

  // Add filename and line number if available
  if (filename) {
    output += ` [${filename}${line ? `:${line}` : ''}]`;
  }

  // Handle message and data separately
  if (typeof message === 'object') {
    output += `: ${JSON.stringify(message, null, 2)}`;
  } else if (Array.isArray(metadata?.['0'])) {
    // Handle logger.info('message', [...data])
    output += `: ${message}\n${JSON.stringify(metadata['0'], null, 2)}`;
  } else if (typeof metadata?.['0'] === 'object') {
    // Handle logger.info('message', {data})
    output += `: ${message}\n${JSON.stringify(metadata['0'], null, 2)}`;
  } else {
    output += `: ${message}`;
    // Add remaining metadata if present
    const remainingMetadata = { ...metadata };
    delete remainingMetadata['0']; // Remove already processed data
    if (Object.keys(remainingMetadata).length > 0) {
      output += `\n${JSON.stringify(remainingMetadata, null, 2)}`;
    }
  }

  // Format stack trace if present
  if (stack) {
    output += '\n❌ Stack Trace:\n' + stack;
  }

  return output;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize(),
    devFormat
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
