module.exports = {
    name: "$message",
    description: "Returns the command arguments. Args: [index (optional)]",
    takesBrackets: true,
    execute: async (context, args) => {
        const argIndexStr = args[0]?.trim();
        const commandArgs = context.args || [];

        if (argIndexStr) {
            const index = parseInt(argIndexStr, 10);
            if (isNaN(index) || index < 1) {
                return "Error: $message requires a positive number index";
            }
            return commandArgs[index - 1] || "";
        } else {
            return commandArgs.join(" ");
        }
    }
};
