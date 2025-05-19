module.exports = {
    name: "$thumbnail",
    description: "Sets the thumbnail URL of the embed.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $thumbnail requires a URL";
        context.embedData = context.embedData || {};
        context.embedData.thumbnail = { url: args[0] };
        return "";
    }
};
