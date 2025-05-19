module.exports = {
    name: "$replaceText",
    description: "Replaces occurrences of a search string with a replacement string. Args: text;search;replace;[limit=-1]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || args[1] === undefined || args[2] === undefined) return "[Error: $replaceText requires text, search, and replace arguments]";
        const text = args[0]; const search = args[1]; const replace = args[2];
        const limit = args[3] !== undefined ? parseInt(args[3], 10) : -1;
        if (isNaN(limit)) return "Error: Invalid limit for $replaceText";
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        try {
            const regex = new RegExp(escapedSearch, 'g');
            if (limit === -1) return text.replace(regex, replace);
            let count = 0;
            return text.replace(regex, match => { count++; return (count <= limit) ? replace : match; });
        } catch (e) { return `Error creating regex for $replaceText: ${e.message}`; }
    }
};
