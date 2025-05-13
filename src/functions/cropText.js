module.exports = {
    name: "$cropText",
    description: "Limits text to a max length. If text is cropped AND endChars is provided, appends endChars within the limit. Args: text;maxLength;[endChars]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || args[1] === undefined) return "[Error: $cropText requires text and maxLength]";
        const text = String(args[0]);
        const maxLength = parseInt(args[1], 10);
        const endCharsArgProvided = args[2] !== undefined;

        if (isNaN(maxLength) || maxLength < 0) return "[Error: Invalid maxLength]";

        if (text.length <= maxLength) return text; 
        if (endCharsArgProvided) {
            const endChars = String(args[2]);
            const sliceIndex = Math.max(0, maxLength - endChars.length);
            return text.slice(0, sliceIndex) + endChars;
        } else {

            return text.slice(0, maxLength);
        }
    }
};
