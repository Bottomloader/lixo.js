module.exports = {
    name: "$addTimestamp",
    description: "Adds a timestamp to the embed, defaults to current time. Args: [milliseconds]",
    takesBrackets: true,
    execute: async (context, args) => {
        context.embedData = context.embedData || {};
        let timestamp = Date.now();
        if (args[0]) {
            const parsed = parseInt(args[0], 10);
            if (!isNaN(parsed)) {
                timestamp = parsed;
            } else {
                return `Error: Invalid timestamp value "${args[0]}" for $addTimestamp`;
            }
        }
        context.embedData.timestamp = new Date(timestamp).toISOString();
        return "";
    }
};
