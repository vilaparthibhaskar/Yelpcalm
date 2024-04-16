class UserError extends Error{
    constructor(statuscode, message){
        super(message);
        this.statuscode = statuscode;
        this.message = message;
    }
}

module.exports = UserError;

const catchAsync = (fn) => {
    return (req, res, next) => {
            fn(req, res).catch(next);
    }
}

module.exports = {
    UserError,
    catchAsync
}