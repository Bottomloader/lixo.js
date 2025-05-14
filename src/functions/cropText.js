module.exports = {
    name: "$cropText",
    description: "Limits text to a max length. If text is cropped AND endChars is provided, appends endChars within the limit. Args: text;maxLength;[endChars]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || args[1] === undefined) return "Error: $cropText requires text and maxLength";
        if (isNaN(args[1]) return "Error: $cropText expected a number"
        const number = parseInt(args[1], 10);
        const elipsis = args[2] == undefined ? "" : args[2];
        return args[0].slice(0, number) + elipsis;
    }
}
