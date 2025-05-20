const { ContainerBuilder, ComponentType, MessageFlags } = require("discord.js");

module.exports = {
    name: "$startContainer",
    description: "Creates a new container.",
    takesBrackets: true,
    execute: async (context, args) => {
        context.components = context.components || [];
        context.checks = context.checks || {};
        if (context.checks.compv2? === true) return console.warn("Error: cannot create container inside of a continer");
        context.checks.compv2 = true;
        if (context.checks.compv2 == true) return "Error: cannot create container inside of a continer"
        const payload = {};
        payload.flags = MessageFlags.IsComponentsV2
        context.components.push(new ContainerBuilder())
        const c = context.components.at(-1);
        if (!(c instanceof ContainerBuilder)) return;
        if (args[0]) {
          let color = args[0];
          if (color.includes("#")) color = parseInt(color.replace("#", ""), 16)
          const test = /^[0-9A-Fa-f]{6}$/.test(color);
          if (!test) return "Error: $container expected valid color.";
          c.setAccentColor(Number(color));
        };
        if (args[1]) {
          const spoiler = args[1] == true
          c.setSpoiler(spoiler)
        };
        return "";
    }
};
