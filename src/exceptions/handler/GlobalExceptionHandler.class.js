class GlobalExceptionHandler extends Error{
    constructor(message) {
        super(message);
        this.name= this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.timestamp = new Date();
    }
}

class VehicleNotFoundException extends GlobalExceptionHandler{
    constructor(message) {
        super(message);
    }
}

class NotFoundDataException extends GlobalExceptionHandler{
    constructor(message) {
        super(message);
    }
}
class OptionNotValidException extends GlobalExceptionHandler{
    constructor(message) {
        super(message);
    }
}

module.exports = {VehicleNotFoundException,NotFoundDataException,OptionNotValidException};
