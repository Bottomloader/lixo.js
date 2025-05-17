module.exports = {
    name: "$defaultTo",
    description: "Defaults to a text if the string is undefined or empty. Args: [text];defaultTo",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[1]) return "Error: $defaultTo expected to get text and defaultTo args.";
        if (args[0] == "" || args[0] == null || args[0] == undefined) return args[1];
        return args[0];
    }
};
