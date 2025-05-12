module.exports = {
    name: "$description",
    description: "Sets the description of the embed.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $description requires text";
        context.embedData = context.embedData || {};
        context.embedData.description = args[0];
        return "";
    }
};
