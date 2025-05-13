const util = require('util');
const { inspect } = util;

module.exports = {
    name: "$djsEval", description: "Evaluates raw JavaScript code.", takesBrackets: true,
    execute: async (context, args) => {
        const code = args.join(';'); if (!code) return "Error: $djsEval requires code to evaluate";
        const client = context.client; const message = context.message; const interaction = context.interaction;
        const channel = context.channel; const guild = context.guild; const user = context.user; const member = context.member;
        const variables = context.variables; const localVariables = context.localVariables; const contextObj = context;
        let evaled;
        try { evaled = await eval(`(async () => { ${code} })()`); }
        catch (error) { console.error("Error during $djsEval:", error); return `Eval Error: ${error.message || error}`; }
        let output = evaled;
        if (typeof evaled === 'object') output = inspect(evaled, { depth: 1 });
        else output = String(output); 
        if (typeof output === 'string' && client.token && output.includes(client.token)) output = output.replace(new RegExp(client.token, 'g'), '[TOKEN REDACTED]');
        const MAX_LENGTH = 1900;
        if (output.length > MAX_LENGTH) output = output.substring(0, MAX_LENGTH) + "...";
        return output;
    }
};
