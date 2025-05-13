module.exports = {
    name: "$ternary",
    description: "Evaluates simple condition. Args: condition;then;[else]", 
    takesBrackets: true,
    execute: async (context, args) => {
        if (args.length < 2) return "Error: $ternary requires condition and then arguments";
        const conditionStr = args[0]; const thenValue = args[1]; const elseValue = args[2] !== undefined ? args[2] : "";
        let conditionResult = false;
        try {
            const conditionParts = conditionStr.match(/^(.+)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
            if (conditionParts) {
                let val1 = conditionParts[1].trim();
                let op = conditionParts[2];
                let val2 = conditionParts[3].trim();

                if (val1.startsWith('$get[') && context?.client?.functionParser) {
                    try { val1 = await context.client.functionParser.parse(val1, context); }
                    catch (parseError) { console.warn(`$ternary: Error parsing val1 "${conditionParts[1].trim()}": ${parseError.message}`); }
                }
                if (val2.startsWith('$get[') && context?.client?.functionParser) {
                     try { val2 = await context.client.functionParser.parse(val2, context); }
                     catch (parseError) { console.warn(`$ternary: Error parsing val2 "${conditionParts[3].trim()}": ${parseError.message}`); }
                }

                const num1 = parseFloat(val1);
                const num2 = parseFloat(val2);
                const areNumbers = !isNaN(num1) && !isNaN(num2);

                switch (op) {
                    case '==': conditionResult = areNumbers ? num1 === num2 : String(val1) === String(val2); break;
                    case '!=': conditionResult = areNumbers ? num1 !== num2 : String(val1) !== String(val2); break;
                    case '>': conditionResult = areNumbers ? num1 > num2 : false; break;
                    case '<': conditionResult = areNumbers ? num1 < num2 : false; break;
                    case '>=': conditionResult = areNumbers ? num1 >= num2 : false; break;
                    case '<=': conditionResult = areNumbers ? num1 <= num2 : false; break;
                }
            } else {
                const conditionLower = String(conditionStr)?.toLowerCase()?.trim();
                conditionResult = (conditionLower === 'true' || conditionLower === 'yes' || conditionLower === '1');
            }
        } catch (e) {
             console.warn(`$ternary: Error evaluating condition "${conditionStr}" with args [${args.join(';')}] : ${e.message}`);
             conditionResult = false;
        }

        return conditionResult ? thenValue : elseValue;
    }
};
