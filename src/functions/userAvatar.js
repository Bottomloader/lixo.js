module.exports = {
    name: "$userAvatar",
    description: "Returns an users avatar. Args: [userID];[size];[dynamic];[extension]",
    takesBrackets: true,
    execute: async (context, args) => {
            try {
              let user = args[0] ? args[0]: context.interaction?.user?.id ?? context.message?.author?.id;
              user = await context.client.users.fetch(user);
              const size = args[1] || 4096;
              const dynamic = args[2] || true;
              const extension = "webp";
              return user.displayAvatarURL({size: Number(size), forceStatic: dynamic === 'false', extension})
            } catch (e) {
              return "Error: Something went wrong: " + e;
            };
    }
};
