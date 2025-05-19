const { Colors } = require("discord.js");

function hex2int(hex) {
    return parseInt(hex.replace("#", ""), 16);
}

function int2hex(int) {
    return Number(int).toString(16);
}

function resolveColor(value) {
    if (typeof value === "number" || !isNaN(Number(value)))
        return Number(value);

    if (value === "Random")
        return Math.floor(Math.random() * 0xFFFFFF);
    else if (Object.prototype.hasOwnProperty.call(Colors, value))
        return Colors[value];
    else 
        return hex2int(value);
}

module.exports = { hex2int, int2hex, resolveColor };
