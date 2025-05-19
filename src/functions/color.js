const { resolveColor } = require('discord.js');

module.exports = {
    name: "$color",
    description: "Sets the color of the embed.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "[Error: $color requires a hex color code or resolvable color name]";
        context.embedData = context.embedData || {};
        try {
            context.embedData.color = resolveColor(args[0]);
        } catch (e) {
            return `[Error: Invalid color "${args[0]}" for $color]`;
        }
        return "";
    }
};
