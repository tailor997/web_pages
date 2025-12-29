/**
 * Logger utility for detailed error logging
 * Provides methods to log errors with module, file, line number and context
 */

class Logger {
  /**
   * Log levels
   */
  static LEVELS = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  };

  /**
   * Initialize logger
   * @param {string} moduleName - Name of the module using the logger
   */
  constructor(moduleName) {
    this.moduleName = moduleName;
    this.logLevel = Logger.LEVELS.DEBUG;
  }

  /**
   * Set log level
   * @param {string} level - Log level to set
   */
  setLogLevel(level) {
    this.logLevel = level;
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} context - Additional context information
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 
      ? ` Context: ${JSON.stringify(context, null, 2)}`
      : '';
    
    return `${timestamp} [${level}] [${this.moduleName}] ${message}${contextStr}`;
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} context - Additional context information
   */
  debug(message, context = {}) {
    if (this.shouldLog(Logger.LEVELS.DEBUG)) {
      console.debug(this.formatMessage(Logger.LEVELS.DEBUG, message, context));
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} context - Additional context information
   */
  info(message, context = {}) {
    if (this.shouldLog(Logger.LEVELS.INFO)) {
      console.info(this.formatMessage(Logger.LEVELS.INFO, message, context));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context information
   */
  warn(message, context = {}) {
    if (this.shouldLog(Logger.LEVELS.WARN)) {
      console.warn(this.formatMessage(Logger.LEVELS.WARN, message, context));
    }
  }

  /**
   * Log error message
   * @param {Error} error - Error object
   * @param {string} message - Custom error message
   * @param {Object} context - Additional context information
   */
  error(error, message = '', context = {}) {
    if (this.shouldLog(Logger.LEVELS.ERROR)) {
      const errorMessage = message ? `${message}: ${error.message}` : error.message;
      const errorContext = {
        ...context,
        stack: error.stack,
        errorName: error.name,
        errorCode: error.code
      };
      
      console.error(this.formatMessage(Logger.LEVELS.ERROR, errorMessage, errorContext));
    }
  }

  /**
   * Check if message should be logged based on current log level
   * @param {string} level - Log level to check
   * @returns {boolean} Whether message should be logged
   */
  shouldLog(level) {
    const levels = Object.values(Logger.LEVELS);
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  /**
   * Log FreeType specific errors with additional context
   * @param {Error} error - FreeType error
   * @param {string} fontName - Name of the font being processed
   * @param {Object} fontOptions - Font processing options
   */
  freetypeError(error, fontName, fontOptions = {}) {
    const errorContext = {
      fontName,
      fontOptions,
      freeTypeError: parseInt(error.message.match(/:\s*(\d+)$/)?.[1] || '-1', 10),
      freeTypeErrorName: this.getFreeTypeErrorName(parseInt(error.message.match(/:\s*(\d+)$/)?.[1] || '-1', 10))
    };
    
    this.error(error, `FreeType error processing font ${fontName}`, errorContext);
  }

  /**
   * Get FreeType error name from error code
   * @param {number} errorCode - FreeType error code
   * @returns {string} FreeType error name
   */
  getFreeTypeErrorName(errorCode) {
    const freeTypeErrors = {
      0: 'FT_Err_Ok',
      1: 'FT_Err_Cannot_Open_Resource',
      2: 'FT_Err_Unknown_File_Format',
      3: 'FT_Err_Invalid_File_Format',
      4: 'FT_Err_Invalid_Version',
      5: 'FT_Err_Lower_Module_Version',
      6: 'FT_Err_Invalid_Argument',
      // ... add more error codes as needed
      85: 'FT_Err_Invalid_Argument' // Common error code for invalid arguments
    };
    
    return freeTypeErrors[errorCode] || `FT_Err_Unknown_${errorCode}`;
  }
}

export default Logger;
