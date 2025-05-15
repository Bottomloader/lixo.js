module.exports = {
    name: "$channelID",
    description: "Returns the current channel ID.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args[0]) {
          try {
            const guild = await context.client.guilds.fetch(context.guild.id);
            const channels = await guild.channels.fetch();
            const targetChannel = channels.find(c => c.name === args[0]);

            return targetChannel.id
          } catch (e) {
            return "Error: $channelID couldn't fetch the channel with the reason:" + e;
          }
        } else if (context.channel) {
          return context.channel.id;
        };
        return "Error: $channelID couldn't find the channel.";
    }
};
