module.exports = {
    name: "$let",
    description: "Sets a temporary (local) variable's value for the current execution. Args: variableName;value",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args.length < 2) return "[Error: $let requires variableName and value]";
        const varName = args[0].trim();
        const value = args[1];
        if (!varName) return "Error: Variable name cannot be empty in $let";

        if (!context.localVariables) context.localVariables = new Map();

        context.localVariables.set(varName, value);
        return "";
    }
};
