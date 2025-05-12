const fs = require('fs');
const path = require('path');

function loadFiles(dirPath, fileSuffix = '.js', recursive = false) {
    const results = [];
    if (!fs.existsSync(dirPath)) {
        return results;
    }

    try {
        const filesAndDirs = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const item of filesAndDirs) {
            const fullPath = path.join(dirPath, item.name);
            if (item.isDirectory() && recursive) {
                results.push(...loadFiles(fullPath, fileSuffix, recursive));
            } else if (item.isFile() && item.name.endsWith(fileSuffix)) {
                results.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`FileUtils: Error reading directory ${dirPath}:`, error);
    }
    return results;
}

function requireUncached(modulePath) {
    try {
        const absolutePath = path.resolve(modulePath);
        delete require.cache[require.resolve(absolutePath)];
        return require(absolutePath);
    } catch (error) {
        console.error(`FileUtils: Error requiring file ${modulePath}:`, error);
        return null;
    }
}


module.exports = {
    loadFiles,
    requireUncached,
};
