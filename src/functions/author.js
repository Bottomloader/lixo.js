module.exports = {
    name: "$author",
    description: "Sets the author of the embed. Args: name;[iconURL];[url]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $author requires at least a name";
        context.embedData = context.embedData || {};
        context.embedData.author = {
            name: args[0],
            icon_url: args[1] || undefined,
            url: args[2] || undefined
        };
        return "";
    }
};
