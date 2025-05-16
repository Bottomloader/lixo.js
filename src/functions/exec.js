const cld = require('child_process');
module.exports = {
  name: "$exec",
  description: "Runs exec code.",
  takesBrackets: true,
  execute: async (context, args) => {
    if (!args[0]) return "Error: $exec expected code.";
    return cld.execSync(args[0]).toString();
  }
};

