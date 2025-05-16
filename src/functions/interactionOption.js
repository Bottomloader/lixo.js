module.exports = {
    name: "$interactionOption",
    description: "Retrieves the value of a slash command option.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!context.interaction?.isChatInputCommand() || !context.options) return "Error: $interactionOption requires chat input command context";
        if (!args[0]) return "Error: $interactionOption requires the option name";
        const optionName = args[0].toLowerCase();
        const option = context.options.get(optionName);
        if (!option) return "";
        if (option.attachment) return option.attachment.url;
        if (option.user) return option.user.id;
        if (option.member) return option.member.id;
        if (option.channel) return option.channel.id;
        if (option.role) return option.role.id;
        return option.value !== undefined ? String(option.value) : "";
    }
};
