module.exports = {
    name: "$clientToken",
    description: "Returns a redacted client token string.",
    takesBrackets: false,
    execute: async (context, args) => {
        const token = context.client.token || process.env.DISCORD_TOKEN;
        if (token) return token;
        return "TOKEN NOT AVAILABLE";
    }
};
