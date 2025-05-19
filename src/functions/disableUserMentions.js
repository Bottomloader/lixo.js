module.exports = {
    name: "$disableUserMentions",
    description: "Doesn't send a notification when pinging users.",
    takesBrackets: true,
    execute: async (context, args) => {
        payload.allowedMentions.users = []
        return "";
    }
};
