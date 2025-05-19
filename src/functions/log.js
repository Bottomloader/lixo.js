module.exports = {
    name: "$log",
    description: "Logs a message to the console.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $log needs a message to log.";
        console.log(args[0])
    }
};
