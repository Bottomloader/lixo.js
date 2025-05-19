const { ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
    name: "$addButton",
    description: "Adds a button to the current message component row. Args: customIDOrURL;label;style(Primary/Secondary/Success/Danger/Link);[disabled(true)];[emoji]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args.length < 3) return "Error: $addButton requires customID/URL, label, and style";
        const [customIdOrUrl, label, styleStr, disabledStr, emoji] = args;
        let style; let isLink = false;
        switch(styleStr?.toLowerCase()){
            case 'primary': style = ButtonStyle.Primary; break; case 'secondary': style = ButtonStyle.Secondary; break;
            case 'success': style = ButtonStyle.Success; break; case 'danger': style = ButtonStyle.Danger; break;
            case 'link': style = ButtonStyle.Link; isLink = true; break;
            default: return `Error: Invalid button style "${styleStr}". Use Primary, Secondary, Success, Danger, or Link`;
        }
        const button = new ButtonBuilder().setLabel(label);
        if (emoji) { try { button.setEmoji(emoji); } catch(e) { /* ignore */ } }
        if (isLink) {
             if (!customIdOrUrl.startsWith('http:') && !customIdOrUrl.startsWith('https:') && !customIdOrUrl.startsWith('discord:')) return "[Error: Link button requires a valid URL]";
             button.setURL(customIdOrUrl).setStyle(style);
        } else {
             if (customIdOrUrl.length > 100) return "Error: Button customID cannot exceed 100 characters";
             if (!customIdOrUrl) return "Error: Non-link buttons require a customID";
             button.setCustomId(customIdOrUrl).setStyle(style);
             if(disabledStr?.toLowerCase() === 'true') button.setDisabled(true);
        }
        context.components = context.components || [];
        context.components.push(button.toJSON());
        return "";
    }
};
