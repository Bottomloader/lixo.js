const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
    name: "$channelSendMessage", description: "Sends a message to a specific channel ID. Args: channelID;content;[returnMsgID(true)?]", takesBrackets: true,
    execute: async (context, args) => {
        if (args.length < 2) return "Error: Requires channelID and content";
        const channelId = args[0]; const content = args[1]; const returnMsgID = args[2]?.toLowerCase() === 'true';
        let embedToSend = null; if (context.embedData && Object.keys(context.embedData).length > 0) { try { embedToSend = new EmbedBuilder(context.embedData); } catch (e) { return `[Error building embed: ${e.message}]`; } }
        const payload = {}; if (content) payload.content = content; if (embedToSend) payload.embeds = [embedToSend];
        if (context.components && context.components.length > 0) { /* ... component building logic ... */ payload.components = []; let currentRow = new ActionRowBuilder(); for (const componentJson of context.components) { if (currentRow.components.length >= 5) { payload.components.push(currentRow); currentRow = new ActionRowBuilder(); } try { currentRow.addComponents(componentJson); } catch {}} if (currentRow.components.length > 0) payload.components.push(currentRow); }
        if (!payload.content && !payload.embeds && !payload.components?.length > 0) return "[Error: Nothing to send]";
        try { const channel = await context.client.channels.fetch(channelId); if (!channel?.isTextBased()) return "[Error: Channel not found or not text-based]"; const sentMsg = await channel.send(payload); context.embedData={}; context.components=[]; return returnMsgID ? sentMsg.id : ""; }
        catch (e) { return `Error sending to channel ${channelId}: ${e.message}`; }
    }
};
