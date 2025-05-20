module.exports = {
    name: "$stopContainer",
    description: "Stops a container.",
    takesBrackets: false,
    execute: async (context, args) => {
        context.checks = context.checks || {};
        context.checks.compv2 = false;
    }
};
