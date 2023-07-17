# Logger

The Logger module provides a flexible and advanced logging functionality for your Node.js applications.

## Features

- Multiple log levels (info, warn, error)
- Log formatting with timestamp and log level
- Console logging with configurable log level
- Log file rotation based on size and number of files
- Error handling and stack trace logging
- Log file compression (optional)
- Log persistence (optional)
- Log metadata support
- Log filtering based on level and metadata
- Easy integration and customization

## Installation

```bash
npm install advanced-logger
```


## Usage

```javascript
const Logger = require("advanced-logger");

const logger = new Logger({
  logLevel: "info",
  logFile: "logs/app.log",
  maxSize: 5242880, // 5MB
  maxFiles: 5,
  enableConsoleLogging: true,
  compressLogs: false,
  persistLogs: true,
});

logger.log("This is an info log.");
logger.warn("This is a warning log.");
logger.error("This is an error log.", new Error("Some error"));

// Filter logs
const filteredLogs = logger.filterLogs({ level: "warn" });
console.log(filteredLogs);

// Get all logs
const allLogs = logger.getAllLogs();
console.log(allLogs);
```

## Configuration

The following configuration options are available when creating a new Logger instance:

- `logLevel`: The log level for the logger (info, warn, error). Default: 'info'.
- `logFile`: The path to the log file. Default: 'logs/app.log'.
- `maxSize`: The maximum size of the log file before rotation (in bytes). Default: 5242880 (5MB).
- `maxFiles`: The maximum number of log files to retain. Default: 5.
- `enableConsoleLogging`: Enable or disable console logging. Default: true.
- `compressLogs`: Enable or disable log file compression. Default: false.
- `persistLogs`: Enable or disable log persistence. Default: true.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`.
3. Make your changes and commit them: `git commit -am 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).


