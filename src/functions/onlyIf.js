const StopExecutionError = require('../errors/StopExecutionError');
module.exports = {
    name: "$onlyIf",
    description: "Stops execution if a condition is false. Args: condition;[errorMsg]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) throw new StopExecutionError("Error: $onlyIf requires a condition");
        const condition = args[0]?.toLowerCase()?.trim();
        const errorMsg = args[1] || "";
        const isFalse = (condition === 'false' || condition === 'no' || condition === '0' || condition === '');
        if (isFalse) {
            throw new StopExecutionError(errorMsg);
        }
        return "";
    }
};
