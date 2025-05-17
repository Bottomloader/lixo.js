module.exports = {
    name: "$editedMessage",
    description: "Returns a property or word of old/new edited message. Args: [old|new; property?; index?]",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $editMessage expected old or new in first arg";

        const update = args[0].trim().toLowerCase();
        const property = args[1]?.trim();
        const index = args[2]?.trim();

        let msg;

        if (update === "old") {
            msg = context.oldMessage || {};
        } else if (update === "new") {
            msg = context.newMessage || {};
        } else {
            return "Error: $editMessage expected old or new in first arg";
        }

        if (!property) {
            return msg;
        }

        const pro = msg[property];

        if (pro === undefined) {
            return `Error: Property '${property}' not found on ${update} message`;
        }

        if (index) {
            const i = parseInt(index, 10);
            if (isNaN(i) || i < 1) {
                return "Error: Index must be a positive number";
            }
            if (typeof pro !== "string") {
                return `Error: Property '${property}' is not a string`;
            }
            const rindex = pro.split(/\s+/);
            return rindex[i - 1] || "";
        } else {
            return pro;
        }
    }
};
