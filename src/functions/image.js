module.exports = {
    name: "$image",
    description: "Sets the main image URL of the embed.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $image requires a URL";
        context.embedData = context.embedData || {};
        context.embedData.image = { url: args[0] };
        return "";
    }
};
