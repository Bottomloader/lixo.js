module.exports = {
    name: "$startsWith",
    description: "Checks if the text starts with the substring",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || !args[1]) return "Error: $startsWith needs a text and a substring.";
        return args[0].startsWith(args[1]);
    }
};
