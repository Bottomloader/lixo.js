module.exports = {
    name: "$clear",
    description: "Bulk deletes messages.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || args[0] <= 0 || args[0] >= 101) return "Error: $clear expected amount argument or got less/much amount.";
        if (isNaN(parseInt(args[0]))) return "Error: $clear expected number.";
        await context.message.channel.bulkDelete(parseInt(args[0]), true);
    }
};
