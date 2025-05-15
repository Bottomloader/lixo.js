module.exports = {
    name: "$c",
    description: "Ignores the content within the brackets. Used for adding comments to code.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (context.channel) return context.channel.id;
        return "Error: $channelID couldn't find the channel.";
    }
};
