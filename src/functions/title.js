module.exports = {  
    name: "$title",  
    description: "Sets the title of the embed. Args: [text];[url]",  
    takesBrackets: true,  
    execute: async (context, args) => {  
        if (!args[0]) return "Error: $title requires text";  
        context.embedData = context.embedData || {};  
        context.embedData.title = args[0];  
        if (args[1]) context.embedData.url = args[1];
        return "";  
    }  
};
