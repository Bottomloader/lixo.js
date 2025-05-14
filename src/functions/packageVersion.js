const fs = require('fs');
const path = require('path');
let version = 'N/A';
try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        version = packageJson.version || 'N/A';
    }
} catch (e) { console.error("Failed to read package.json for version:", e); }

module.exports = {
    name: "$packageVersion", description: "Returns the current version of the Lixo package.", takesBrackets: false,
    execute: async (context, args) => { return version; }
};
