const { Team } = require("discord.js");

module.exports = {
    name: "$clientOwnerID",
    description: "Returns the bot's owner ID.",
    takesBrackets: true,
    execute: async (context, args) => {
        const separator = args[0] || ",";
        const owner = (await context.client.application.fetch()).owner;
         if (owner instanceof Team) {
          return owner.members.map((x) => x.id).join(separator);
        } else {
          return owner.id;
        }
    }
};
