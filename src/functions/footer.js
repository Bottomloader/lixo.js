module.exports = {
    name: "$footer",
    description: "Sets the footer of the embed. Args: text;[iconURL]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "[Error: $footer requires text]";
        context.embedData = context.embedData || {};
        context.embedData.footer = {
            text: args[0],
            icon_url: args[1] || undefined
        };
        return "";
    }
};
