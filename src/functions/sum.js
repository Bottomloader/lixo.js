module.exports = {
    name: "$sum",
    description: "Sums two or more numbers up.",
    takesBrackets: true,
    execute: async (context, args) => {
            if (args.length < 2) return "Error: $sum needs two numbers to sum.";
            const numbers = [...args]
            if (numbers.some(x => isNaN(x))) return "Error: $sum has an invalid number provided in";
            return numbers.reduce((a, b) => Number(a) + Number(b));
    }
};
