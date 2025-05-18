module.exports = {
    name: "$c",
    description: "Ignores the content within the brackets. Used for adding comments to code.",
    takesBrackets: true,
    execute: async (context, args) => {
        payload.allowedMentions.users = []
        return "";
    }
};
