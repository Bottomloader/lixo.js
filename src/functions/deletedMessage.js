module.exports = {
    name: "$deletedMessage",
    description: "Returns a property or word of deleted message. Args: [property?; index?]",
    takesBrackets: true,
    execute: async (context, args) => {

        const property = args[0]?.trim();
        const index = args[1]?.trim();

        let msg = context.deletedMessage

        if (!property) {
            return msg;
        }

        const pro = msg[property];

        if (index) {
            const i = parseInt(index, 10);
            if (isNaN(i) || i < 1) {
                return "Error: Index must be a positive number";
            }

            const rindex = pro.split(/\s+/);
            return rindex[i - 1] || "";
        } else {
            return pro;
        }
    }
};
