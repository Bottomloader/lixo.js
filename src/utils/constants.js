const { GatewayIntentBits, Partials } = require('discord.js');

const DEFAULT_INTENTS = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
];

const DEFAULT_PARTIALS = [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User,
    Partials.Reaction
];

const DEFAULT_PREFIX = "";

const COMMAND_TYPES = {
    MESSAGE: 'message',
    INTERACTION: 'interaction',
    BOTH: 'both',
    BUTTON: 'button',
    SELECT_MENU: 'selectMenu',
    MODAL_SUBMIT: 'modalSubmit',
    EVENT: 'event',
};

const INTERACTION_COMMAND_TYPES = [COMMAND_TYPES.INTERACTION, COMMAND_TYPES.BOTH];
const MESSAGE_COMMAND_TYPES = [COMMAND_TYPES.MESSAGE, COMMAND_TYPES.BOTH];

module.exports = {
    DEFAULT_INTENTS,
    DEFAULT_PARTIALS,
    DEFAULT_PREFIX,
    COMMAND_TYPES,
    INTERACTION_COMMAND_TYPES,
    MESSAGE_COMMAND_TYPES,
};
