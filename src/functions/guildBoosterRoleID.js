module.exports = {
    name: "$guildBoosterRoleID",
    description: "Returns server booster role ID",
    takesBrackets: true,
    execute: async (context, args) => {
        return context.guild?.roles.premiumSubscriberRole?.id;
    }
};
