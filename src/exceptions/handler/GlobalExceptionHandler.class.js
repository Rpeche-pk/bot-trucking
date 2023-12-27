class GlobalExceptionHandler extends Error{
    constructor(message) {
        super(message);
        this.name= this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.timestamp = new Date();
    }
}

module.exports = GlobalExceptionHandler;
