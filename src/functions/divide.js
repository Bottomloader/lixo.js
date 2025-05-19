module.exports = {
    name: "$divide",
    description: "Divides two or more numbers up.",
    takesBrackets: true,
    execute: async (context, args) => {
            if (args.length < 2) return "Error: $divide needs two numbers to divide.";
            const numbers = [...args]
            if (numbers.some(x => isNaN(x))) return "Error: $divide has an invalid number provided in";
            return numbers.reduce((a, b) => Number(a) / Number(b));
    }
};
