module.exports = {
    name: "$addField",
    description: "Adds a field to the embed. Args: name;value;[inline(true/false)]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0] || !args[1]) return "Error: $addField requires a name and value";
        context.embedData = context.embedData || {};
        context.embedData.fields = context.embedData.fields || [];
        let inline = false;
        if (args[2]) {
            const inlineArg = args[2].toLowerCase();
            inline = (inlineArg === 'true' || inlineArg === 'yes');
        }
        context.embedData.fields.push({
            name: args[0],
            value: args[1],
            inline: inline
        });
        return "";
    }
};
