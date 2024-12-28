function makeCalculator() {
	return {
		stack: [],
		variables: {},
	}
}

function topOfStack(calculator) {
	return calculator.stack[calculator.stack.length - 1]
}

const operators = {
	"+": calculator => calculator.stack.push(calculator.stack.pop() + calculator.stack.pop()),
	"-": calculator => calculator.stack.push(-calculator.stack.pop() + calculator.stack.pop()),
	"pop": calculator => calculator.stack.pop(),
	"dup": calculator => calculator.stack.push(topOfStack(calculator)),
	"set": calculator => {
		const value = calculator.stack.pop()
		const variableName = calculator.stack.pop()
		calculator.variables[variableName] = value	
	},
	"get": calculator => {
		const variableName = calculator.stack.pop()
		calculator.stack.push(calculator.variables[variableName])	
	},
}

function processOperand(calculator, s) {
	if (!isNaN(parseFloat(s))) {
		calculator.stack.push(parseFloat(s))
	} else if (operators[s]) {
		operators[s](calculator)
	} else {
		calculator.stack.push(s)
	}
}

const calculator = makeCalculator()
// const input = "10 dup +"
const input = "x 10 set y 30 40 + set x get y get -"
input.split(" ").forEach(s => processOperand(calculator, s))

console.log(topOfStack(calculator))