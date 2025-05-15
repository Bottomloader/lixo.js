const StopExecutionError = require('../errors/StopExecutionError');  
  
module.exports = {  
    name: "$try",  
    description: "Returns a custom error instead of the old fashioned errors. Args: code;[error]",  
    takesBrackets: true,  
    execute: async (context, args) => {  
        if (!args[0]) return "Error: $try needs code to parse it.";  
        const text = args[0]  
        const error = args[1] || "";
        let input;
        try {  
          input = await context.client.FunctionParser.parse(text);  
        } catch (e) {  
          if (e instanceof StopExecutionError) {  
            return error;  
          }  
        };  
        if (typeof input == "string" && input.includes("Error: $")) return error  
       return input  
    }  
};
