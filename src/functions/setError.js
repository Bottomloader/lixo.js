module.exports = {
    name: "$setError",
    description: "Sets an error message for the next function that doesn't have error argument but returns an error.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $setError expected an error message";
        context.setError = args[0];
        return "";
    }
};
