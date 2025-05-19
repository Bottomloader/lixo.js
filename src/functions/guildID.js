module.exports = {
    name: "$guildID",
    description: "Returns the current guilds ID",
    takesBrackets: true,
    execute: async (context, args) => {
        return context.guild?.id
    }
};
