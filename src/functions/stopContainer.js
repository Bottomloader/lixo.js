module.exports = {
    name: "$stopContainer",
    description: "Stops the current container definition process.",
    takesBrackets: false,
    execute: async (context, args) => {
        context.checks = context.checks || {};
        if (context.checks.compv2 !== true) {
            return "Error: No container is currently active to stop. Use $startContainer first.";
        }
        context.checks.compv2 = false;
        return "";
    }
};
