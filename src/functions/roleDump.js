module.exports = {
    name: "$roleDump",
    description: "Returns all user ids who have a certain role",
    takesBrackets: true,
    execute: async (context, args) => {
        if (!args[0]) return "Error: $roleDump expected role ID.";
        await context.guild.members.fetch();

        const roleId = args[0]
        const guild = context.guild

        const role =  guild.roles.cache.get(roleId);
        if (!role) return 'Error: $roleDump couldn\'t find the role.';

        const ids = role.members.map(member => member.user.id);
        return ids || "";
    }
};
