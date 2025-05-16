module.exports = {
    name: "$authorID",
    description: "Returns the ID of the user who ran the command.",
    takesBrackets: true,
    execute: async (context, args) => {
        return context.interaction?.user?.id ?? context.message?.author?.id;
    }
};
