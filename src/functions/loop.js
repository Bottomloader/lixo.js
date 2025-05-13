const StopExecutionError = require('../errors/StopExecutionError');
module.exports = {
    name: "$loop",
    description: "Executes Lixo code repeatedly with a delay. Args: delayMs;code;iterations;[stopOnError=true]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args.length < 3) return "Error: $loop requires delayMs, code, and iterations";
        const delayMs = parseInt(args[0], 10); const codeToLoop = args[1];
        const iterations = parseInt(args[2], 10);
        const stopOnError = (args[3]?.trim().toLowerCase() !== 'false');
        const MAX_ITERATIONS = 100; const MIN_DELAY = 500;
        if (isNaN(delayMs) || delayMs < MIN_DELAY) return `[Error: Invalid delay. Minimum is ${MIN_DELAY}ms]`;
        if (!codeToLoop) return "Error: No code provided to loop";
        if (isNaN(iterations) || iterations <= 0 || iterations > MAX_ITERATIONS) return `[Error: Invalid iteration count. Must be between 1 and ${MAX_ITERATIONS}]`;
        let count = 0; let intervalId = null;
        const executeLoopIteration = async () => {
            if (count >= iterations) { if (intervalId) clearInterval(intervalId); return; }
            count++;
            try { await context.client.functionParser.parse(codeToLoop, context); }
            catch (error) {
                console.error(`$loop: Error during iteration ${count}:`, error);
                if (stopOnError) {
                    if (intervalId) clearInterval(intervalId);
                    console.warn(`$loop: Stopping loop due to error.`);
                    if (context.channel && !context.messageSent && !(error instanceof StopExecutionError)) {
                        context.channel.send(`⚠️ Loop stopped due to error on iteration ${count}: ${error.message}`).catch(console.error);
                         context.messageSent = true;
                    }
                     if (error instanceof StopExecutionError && context.channel && !context.messageSent) {
                         context.channel.send(error.message).catch(console.error);
                         context.messageSent = true;
                     }
                }
            }
        };
        intervalId = setInterval(executeLoopIteration, delayMs);
        return "";
    }
};
