class StopExecutionError extends Error {
    constructor(message) {
        super(message);
        this.name = "StopExecutionError";
    }
}

module.exports = StopExecutionError;
