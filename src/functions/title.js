module.exports = {
    name: "$title",
    description: "Sets the title of the embed.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $title requires text";
        context.embedData = context.embedData || {};
        context.embedData.title = args[0];
        return "";
    }
};
