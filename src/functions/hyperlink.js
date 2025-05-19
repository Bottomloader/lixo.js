const { hyperlink } = require('discord.js');
module.exports = {
    name: "$hyperlink",
    description: "Creates a Discord hyperlink. Args: text;url",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args.length < 2) return "Error: $hyperlink requires text and url";
        try {
            return hyperlink(args[0], args[1]);
        } catch (e) {
            return "Error creating hyperlink";
        }
    }
};
