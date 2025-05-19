const { GatewayIntentBits, Partials, ApplicationCommandOptionType, ChannelType } = require('discord.js');

const intentMap = { guilds: GatewayIntentBits.Guilds, guildmembers: GatewayIntentBits.GuildMembers, guildmoderation: GatewayIntentBits.GuildModeration, guildemojisandstickers: GatewayIntentBits.GuildEmojisAndStickers, guildintegrations: GatewayIntentBits.GuildIntegrations, guildwebhooks: GatewayIntentBits.GuildWebhooks, guildinvites: GatewayIntentBits.GuildInvites, guildvoicestates: GatewayIntentBits.GuildVoiceStates, guildpresences: GatewayIntentBits.GuildPresences, guildmessages: GatewayIntentBits.GuildMessages, guildmessagereactions: GatewayIntentBits.GuildMessageReactions, guildmessagetyping: GatewayIntentBits.GuildMessageTyping, directmessages: GatewayIntentBits.DirectMessages, directmessagereactions: GatewayIntentBits.DirectMessageReactions, directmessagetyping: GatewayIntentBits.DirectMessageTyping, messagecontent: GatewayIntentBits.MessageContent, guildscheduledevents: GatewayIntentBits.GuildScheduledEvents, automoderationconfiguration: GatewayIntentBits.AutoModerationConfiguration, automoderationexecution: GatewayIntentBits.AutoModerationExecution, };
const partialMap = { user: Partials.User, channel: Partials.Channel, guildmember: Partials.GuildMember, message: Partials.Message, reaction: Partials.Reaction, guildscheduledevent: Partials.GuildScheduledEvent, threadmember: Partials.ThreadMember };
const optionTypeMap = { sub_command: ApplicationCommandOptionType.Subcommand, sub_command_group: ApplicationCommandOptionType.SubcommandGroup, string: ApplicationCommandOptionType.String, integer: ApplicationCommandOptionType.Integer, boolean: ApplicationCommandOptionType.Boolean, user: ApplicationCommandOptionType.User, channel: ApplicationCommandOptionType.Channel, role: ApplicationCommandOptionType.Role, mentionable: ApplicationCommandOptionType.Mentionable, number: ApplicationCommandOptionType.Number, attachment: ApplicationCommandOptionType.Attachment, };
const channelTypeMap = { 'text': ChannelType.GuildText, 'voice': ChannelType.GuildVoice, 'category': ChannelType.GuildCategory, 'news': ChannelType.GuildAnnouncement, 'stage': ChannelType.GuildStageVoice, 'forum': ChannelType.GuildForum, 'public_thread': ChannelType.PublicThread, 'private_thread': ChannelType.PrivateThread, 'news_thread': ChannelType.AnnouncementThread };

function mapIntents(intentStrings = []) {
    return intentStrings.map(str => {
        const lowerCaseStr = str.toLowerCase().replace(/_/g, '');
        if (intentMap[lowerCaseStr]) return intentMap[lowerCaseStr];
        console.warn(`Unknown intent string "${str}". Skipping.`);
        return null;
    }).filter(bit => bit !== null);
}

function mapPartials(partialStrings = []) {
     return partialStrings.map(str => {
         const lowerCaseStr = str.toLowerCase().replace(/_/g, '');
         if (partialMap[lowerCaseStr]) return partialMap[lowerCaseStr];
         console.warn(`Unknown partial string "${str}". Skipping.`)
         return null;
     }).filter(p => p !== null);
}

function mapOptionType(typeString) {
    return optionTypeMap[typeString?.toLowerCase()] || ApplicationCommandOptionType.String;
}

function mapChannelTypes(typeStrings = []) {
    return typeStrings
        .map(ct => channelTypeMap[ct?.toLowerCase()])
        .filter(ct => ct !== undefined);
}

module.exports = {
    mapIntents,
    mapPartials,
    mapOptionType,
    mapChannelTypes,
    intentMap,
    partialMap,
    optionTypeMap,
    channelTypeMap,
};
