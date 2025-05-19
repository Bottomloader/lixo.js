module.exports = {
    name: "$getVar",
    description: "Gets a variable's value. Args: variableName",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $getVar requires a variableName";
        const varName = args[0].trim(); const scope = args[1]?.trim().toLowerCase() || 'local';
        let value;
        value = context.client.variables?.get(varName);
        return value !== undefined ? String(value) : "";
    }
};
