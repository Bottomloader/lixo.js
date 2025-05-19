module.exports = {
    name: "$sub",
    description: "Subs two or more numbers up.",
    takesBrackets: true,
    execute: async (context, args) => {
            if (args.length < 2) return "Error: $sub needs two numbers to sub.";
            const numbers = [...args]
            if (numbers.some(x => isNaN(x))) return "Error: $sub has an invalid number provided in";
            return numbers.reduce((a, b) => Number(a) - Number(b));
    }
};
