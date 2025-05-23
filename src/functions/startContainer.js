const { ContainerBuilder, ComponentType, MessageFlags } = require("discord.js");

module.exports = {
    name: "$startContainer",
    description: "Creates a new container.",
    takesBrackets: true,
    execute: async (context, args) => {
        context.components = context.components || [];
        context.checks = context.checks || {};

        if (context.checks?.compv2 === true) {
            return "Error: Cannot create a container inside another container. Please close the current container first.";
        }
        context.checks.compv2 = true;

        let containerInstance;
        try {
            containerInstance = new ContainerBuilder();
            context.components.push(containerInstance);
        } catch (e) {
            console.error("Fatal: Failed to instantiate ContainerBuilder:", e);
            context.checks.compv2 = false;
            return "Error: Could not create the container component. Please check server logs.";
        }

        const c = context.components.at(-1);

        if (!(c instanceof ContainerBuilder)) {
            console.warn("Debug: The last component pushed was not a ContainerBuilder instance. This is unexpected.");
            context.checks.compv2 = false;
            return "Error: Failed to initialize container properly after creation.";
        }

        if (args[0] !== undefined) {
            let colorString = String(args[0]);
            let numericColor;

            if (colorString.startsWith("#")) {
                colorString = colorString.substring(1);
            }

            if (!/^[0-9A-Fa-f]{6}$/.test(colorString)) {
                return "Error: $startContainer expected a valid 6-digit hex color (e.g., #RRGGBB or RRGGBB).";
            }
            numericColor = parseInt(colorString, 16);

            if (typeof c.setAccentColor === 'function') {
                c.setAccentColor(numericColor);
            } else {
                console.warn(`Warning: ContainerBuilder instance does not have a 'setAccentColor' method. Argument '${args[0]}' ignored.`);
            }
        }

        if (args[1] !== undefined) {
            const spoilerArg = String(args[1]).toLowerCase();
            const spoiler = spoilerArg === 'true';

            if (typeof c.setSpoiler === 'function') {
                c.setSpoiler(spoiler);
            } else {
                console.warn(`Warning: ContainerBuilder instance does not have a 'setSpoiler' method. Argument '${args[1]}' ignored.`);
            }
        }

        return "";
    }
};
