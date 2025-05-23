module.exports = {
    name: "$memberJoinInfo",
    description: "Returns a property of a member info that joined to the server. Args: [property?]",
    takesBrackets: true,
    execute: async (context, args) => {
        const property = args[0]?.trim();

        if (!property) {
            return context.newMember
        }

        return context.newMember[property]
    }
};
