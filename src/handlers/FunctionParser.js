const StopExecutionError = require('../errors/StopExecutionError');

const MAX_RECURSION_DEPTH = 75;
const ANY_FUNC_REGEX = /\$([a-zA-Z0-9_]+)/g;
const ESCAPED_CHARS_REGEX = /\\([\]\[\\;$])/g;

class FunctionParser {
    constructor(client) {
        this.client = client;
    }

    async _executeFunction(func, context, args, funcName) {
        try {
            const result = await func.execute(context, args);
            if (result === null || result === undefined) {
                return '';
            }
            if (typeof result === 'object') {
                try {
                    return JSON.stringify(result);
                } catch {
                    return 'Object Conversion Error';
                }
            }
            return String(result);
        } catch (error) {
            if (error instanceof StopExecutionError) {
                throw error;
            }
            console.error(`FunctionParser: Error executing ${funcName}:`, error);
            return `${funcName} returned an error: ${error.message}]`;
        }
    }

    _findMatchingBracket(code, startIndex) {
        let depth = 1;
        let escaped = false;
        for (let i = startIndex + 1; i < code.length; i++) {
            const char = code[i];

            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === '\\') {
                escaped = true;
                continue;
            }

            if (char === '[') {
                depth++;
            } else if (char === ']') {
                depth--;
                if (depth === 0) {
                    return i;
                }
            }
        }
        return -1;
    }

    _splitArgs(evaluatedArgsString) {
        if (evaluatedArgsString.length === 0) return [];

        const args = [];
        let currentArg = '';
        let bracketDepth = 0;
        let escaped = false;

        for (let i = 0; i < evaluatedArgsString.length; i++) {
            const char = evaluatedArgsString[i];

            if (escaped) {
                currentArg += char;
                escaped = false;
                continue;
            }

            if (char === '\\') {
                currentArg += char;
                escaped = true;
                continue;
            }

            if (char === '[') bracketDepth++;
            if (char === ']') bracketDepth--;

            if (char === ';' && bracketDepth === 0) {
                args.push(currentArg);
                currentArg = '';
            } else {
                currentArg += char;
            }
        }
        args.push(currentArg);

        const unescapeMap = { ';': ';', '[': '[', ']': ']', '$': '$', '\\': '\\' };

        return args.map(arg =>
            arg.trim().replace(/\\([\]\[\\;$])/g, (match, p1) => unescapeMap[p1] || p1)
        );
    }

    async parse(code, context, currentDepth = 0) {
        if (currentDepth > MAX_RECURSION_DEPTH) {
            console.error("FunctionParser Error: Maximum recursion depth exceeded.");
            return "Error: Max recursion depth reached";
        }
        if (typeof code !== 'string') {
            return String(code ?? '');
        }

        let result = '';
        let lastIndex = 0;
        ANY_FUNC_REGEX.lastIndex = 0;
        let match;

        while ((match = ANY_FUNC_REGEX.exec(code)) !== null) {
            const funcNameWithDollar = match[0];
            const funcNameLower = funcNameWithDollar.toLowerCase();
            const func = this.client.functions.get(funcNameLower);

            const matchStartIndex = match.index;

            result += code.substring(lastIndex, matchStartIndex);

            if (func) {
                let executionResult = null;
                let consumedEndIndex = ANY_FUNC_REGEX.lastIndex;

                if (code[consumedEndIndex] === '[') {
                    const argsStartIndex = consumedEndIndex + 1;
                    const argsEndIndex = this._findMatchingBracket(code, consumedEndIndex);

                    if (argsEndIndex !== -1) {
                        const rawArgsString = code.substring(argsStartIndex, argsEndIndex);
                        const evaluatedArgsString = await this.parse(rawArgsString, context, currentDepth + 1);
                        const args = this._splitArgs(evaluatedArgsString);

                        executionResult = await this._executeFunction(func, context, args, funcNameWithDollar);
                        consumedEndIndex = argsEndIndex + 1;
                    } else {
                        console.warn(`FunctionParser Parse: Malformed brackets for ${funcNameWithDollar} at index ${consumedEndIndex}. Treating as text.`);
                        executionResult = funcNameWithDollar + code[consumedEndIndex];
                        consumedEndIndex++;
                    }
                } else {
                    executionResult = await this._executeFunction(func, context, [], funcNameWithDollar);
                }
                result += executionResult;
                lastIndex = consumedEndIndex;

            } else {
                result += funcNameWithDollar;
                lastIndex = ANY_FUNC_REGEX.lastIndex;
            }
            ANY_FUNC_REGEX.lastIndex = lastIndex;
        }

        result += code.substring(lastIndex);

        if (currentDepth === 0) {
            return result.replace(ESCAPED_CHARS_REGEX, '$1');
        } else {
            return result;
        }
    }
}

module.exports = FunctionParser;
