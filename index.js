const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, splat } = format;
const zlib = require('zlib');

class Logger {
  constructor(config) {
    this.logLevel = config.logLevel || 'info';
    this.logFile = config.logFile || path.join(__dirname, 'logs', 'app.log');
    this.maxSize = config.maxSize || 5242880; // 5MB
    this.maxFiles = config.maxFiles || 5;
    this.enableConsoleLogging = config.enableConsoleLogging !== undefined ? config.enableConsoleLogging : true;
    this.compressLogs = config.compressLogs || false;
    this.persistLogs = config.persistLogs || true;
    this.logger = null;

    this.initializeLogger();
    this.createLogFile();
    this.cleanupOldLogFiles();
  }

  initializeLogger() {
    const logFormat = combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      splat(),
      printf(({ level, message, timestamp, metadata }) => `[${timestamp}] [${level.toUpperCase()}]: ${message} ${metadata ? JSON.stringify(metadata) : ''}`)
    );

    this.logger = createLogger({
      level: this.logLevel,
      format: logFormat,
      transports: [
        new transports.Console({
          format: logFormat,
          silent: !this.enableConsoleLogging,
        }),
        new transports.File({
          filename: this.logFile,
          maxsize: this.maxSize,
          maxFiles: this.maxFiles,
        }),
      ],
    });
  }

  createLogFile() {
    const logDirectory = path.dirname(this.logFile);

    // Create the logs directory if it doesn't exist
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory);
    }

    // Create or overwrite the log file
    fs.writeFileSync(this.logFile, '');
  }

  cleanupOldLogFiles() {
    const logDirectory = path.dirname(this.logFile);

    fs.readdir(logDirectory, (err, files) => {
      if (err) {
        this.error(`Error cleaning up log files: ${err}`);
        return;
      }

      const logFiles = files.filter((file) => file.startsWith('app.log'));

      if (logFiles.length <= this.maxFiles) {
        return;
      }

      const filesToDelete = logFiles.slice(0, logFiles.length - this.maxFiles);
      for (const file of filesToDelete) {
        const filePath = path.join(logDirectory, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            this.error(`Error deleting log file '${filePath}': ${err}`);
          } else {
            this.log(`Deleted log file '${filePath}'`);
          }
        });
      }
    });
  }

  log(message, metadata) {
    this.logger.log('info', message, metadata);
    this.writeToLogFile('info', message, metadata);
  }

  warn(message, metadata) {
    this.logger.log('warn', message, metadata);
    this.writeToLogFile('warn', message, metadata);
  }

  error(message, error, metadata) {
    this.logger.log('error', message, { error, ...metadata });
    this.writeToLogFile('error', message, { error, ...metadata });
  }

  writeToLogFile(level, message, metadata) {
    const logEntry = { level, message, timestamp: new Date().toISOString(), metadata };
    const logString = JSON.stringify(logEntry) + '\n';

    if (this.persistLogs) {
      fs.appendFileSync(this.logFile, logString);

      if (this.compressLogs) {
        this.compressLogFile();
      }
    }
  }

  compressLogFile() {
    const compressedLogFile = `${this.logFile}.gz`;
    const inputStream = fs.createReadStream(this.logFile);
    const outputStream = fs.createWriteStream(compressedLogFile);
    const gzip = zlib.createGzip();

    inputStream.pipe(gzip).pipe(outputStream);

    inputStream.on('end', () => {
      fs.unlink(this.logFile, (err) => {
        if (err) {
          this.error(`Error deleting log file '${this.logFile}': ${err}`);
        } else {
          this.log(`Deleted log file '${this.logFile}'`);
        }
      });
    });
  }

  getLogs(options) {
    const logContents = fs.readFileSync(this.logFile, 'utf-8');
    const logs = logContents.split('\n').filter((line) => line !== '').map((line) => JSON.parse(line));

    if (options && options.level) {
      return logs.filter((log) => log.level === options.level);
    }

    return logs;
  }
}

module.exports = Logger;
