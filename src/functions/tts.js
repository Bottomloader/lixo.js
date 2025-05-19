module.exports = {
    name: "$tts",
    description: "Sends the provided text as a Text-To-Speech message in the current channel. The bot needs 'Send TTS Messages' permission. Args: text",
    takesBrackets: true,
    execute: async (context, args) => {
        const textToSend = args[0];

        if (textToSend === undefined || String(textToSend).trim() === "") {
            return "Error: $tts requires text to send.";
        }

        if (!context.channel || !context.channel.isTextBased?.()) {
            return "Error: $tts can only be used in a context with a text-based channel.";
        }

        try {
            await context.channel.send({
                content: String(textToSend),
                tts: true
            });
            context.messageSent = true;
            return "";
        } catch (error) {
            console.error(`Lixo Function Error ($tts): Failed to send TTS message to channel ${context.channel.id}:`, error);
            if (error.code === 50013) {
                 return "Error: $tts failed. Bot is missing 'Send TTS Messages' permission in this channel.";
            }
            return `Error: $tts failed to send message - ${error.message}`;
        }
    }
};
