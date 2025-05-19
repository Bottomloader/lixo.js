const { ContainerBuilder, ComponentType, MessageFlags } = require("discord.js");

module.exports = {
    name: "$container",
    description: "Creates a new container.",
    takesBrackets: true,
    execute: async (context, args) => {
        context.components = context.components || [];
        const payload = {};
        payload.flags = MessageFlags.IsComponentsV2
        context.components.push(new ContainerBuilder())
        const c = context.components.at(-1);
        if (!(c instanceof ContainerBuilder)) return;
        if (args[1]) {
          let color = args[1];
          if (color.includes("#")) color = parseInt(color.replace("#", ""), 16)
          const test = /^[0-9A-Fa-f]{6}$/.test(color);
          if (!test) return "Error: $container expected valid color.";
          c.setAccentColor(Number(color));
        };
        if (args[2]) {
          const spoiler = args[2] == true
          c.setSpoiler(spoiler)
        };
        return "";
    }
};
