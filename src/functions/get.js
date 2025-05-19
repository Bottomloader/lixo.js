module.exports = {
    name: "$get",
    description: "Gets a temporary (local) variable's value from the current execution. Args: variableName",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $get requires a variableName";
        const varName = args[0].trim();

        const value = context.localVariables?.get(varName);

        return value !== undefined ? String(value) : "";
    }
};
