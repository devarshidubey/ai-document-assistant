class HTTPError extends Error {
    statusCode;

    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}

export default HTTPError;