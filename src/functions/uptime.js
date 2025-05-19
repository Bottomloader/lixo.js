module.exports = {
    name: "$uptime", description: "Returns the bot's uptime. Args: [format(ms/s/m/h/d/full)]", takesBrackets: true,
    execute: async (context, args) => {
        const uptimeMs = context.client.uptime || 0;
        const format = args[0]?.toLowerCase() || 'full';

        const seconds = Math.floor(uptimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        switch(format) {
            case 'ms': return uptimeMs.toString();
            case 's': return seconds.toString();
            case 'm': return minutes.toString();
            case 'h': return hours.toString();
            case 'd': return days.toString();
            case 'full': default:
                const d = days; const h = hours % 24; const m = minutes % 60; const s = seconds % 60;
                let str = "";
                if (d > 0) str += `${d}d `;
                if (h > 0) str += `${h}h `;
                if (m > 0) str += `${m}m `;
                if (s > 0 || str === "") str += `${s}s`;
                return str.trim() || "0s";
        }
    }
};
