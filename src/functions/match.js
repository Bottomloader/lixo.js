module.exports = {
    name: "$match",
    description: "Returns true if regexs matches to the text. Args: regex;text",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || !args[1]) return "Error: $match require's regex and a text.";
        const regex = args[0]
        const text = args[1]
        return !!text.match(regex)
    }
};
