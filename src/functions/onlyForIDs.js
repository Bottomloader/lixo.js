const StopExecutionError = require("../errors/StopExecutionError");

module.exports = {
    name: "$onlyForIDs",
    description: "Throws an error if the authorID is not in user ids. Error message can be set with $onlyForIDsError.",
    takesBrackets: true,
    execute: async (context, args) => {
        if (args.length == 0) return "Error: $onlyForIDs expect IDs."
        const errorMessage = context.ofidsError;
        const ids = args.map(String);
        const user = context.interaction?.user?.id ?? context.message?.author?.id;
        if (!user) throw new StopExecutionError("Error: Couldn't find the author of the command.");
       if (!ids.includes(user)) {
         throw new StopExecutionError(errorMessage);
       };
       return "";
    }
};
