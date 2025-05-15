const StopExecutionError = require('../errors/StopExecutionError');

module.exports = {
    name: "$eval",
    description: "Parses and executes Lixo code provided as input.",
    takesBrackets: true,
    execute: async (context, args) => {
        const codeToParse = args[0];
        if (!codeToParse) return "Error: $eval requires Lixo code inside the brackets";
        try {
            const evalResult = await context.client.functionParser.parse(codeToParse, context);
            return evalResult;
        } catch (error) {
             if (error instanceof StopExecutionError) throw error;
             return `Eval Parse Error: ${error.message || error}`;
        }
    }
};
