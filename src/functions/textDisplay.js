const { ComponentType, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require("discord.js")

module.exports = {
    name: "$textDisplay",
    description: "Adds a text display to the container.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $textDisplay expected content.";
        context.components = context.components || [];
        const payload = {};
        payload.flags = MessageFlags.IsComponentsV2
        const c = context.components.at(-1)
        const text = new TextDisplayBuilder().setContent(args[0])
        if (c instanceof ContainerBuilder) c.addTextDisplayComponents(text)
        else context.components.push(text)
        return "";
    }
};
