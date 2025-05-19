module.exports = {
    name: "$multi",
    description: "Multiplies two or more numbers up.",
    takesBrackets: true,
    execute: async (context, args) => {
            if (args.length < 2) return "Error: $multi needs two numbers to multiply.";
            const numbers = [...args]
            if (numbers.some(x => isNaN(x))) return "Error: $multi has an invalid number provided in";
            return numbers.reduce((a, b) => Number(a) * Number(b));
    }
};
