const { version } = require('discord.js');
module.exports = {
    name: "$djsVersion", description: "Returns the installed discord.js version.", takesBrackets: false,
    execute: async (context, args) => { return version || "N/A"; }
};
