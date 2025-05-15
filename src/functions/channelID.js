module.exports = {
    name: "$channelID",
    description: "Returns the current channel ID.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args[0]) {
          try {
            const channelId =  args[0];
            targetChannel = context.client.channels.cache.get(channelId) || await context.client.channels.fetch(channelId);
            return targetChannel.name;
          } catch (e) {
            return "Error: $channelID couldn't fetch the channel with the reason:" + e;
          }
        } else if (context.channel) {
          return context.channel.id;
        };
        return "Error: $channelID couldn't find the channel.";
    }
};
