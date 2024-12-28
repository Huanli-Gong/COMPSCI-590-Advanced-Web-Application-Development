type StackElement = number | string

interface Calculator {
	stack: StackElement[]
	variables: Record<string, number>
}

function makeCalculator() {
	return <Calculator>{
		stack: [],
		variables: {},
	}
}

function topOfStack(calculator: Calculator) {
	return calculator.stack[calculator.stack.length - 1]
}

const operators: Record<string, (c: Calculator) => void> = {
	"+": calculator => calculator.stack.push(
		(calculator.stack.pop() as number) + (calculator.stack.pop() as number)
	),
	"-": calculator => calculator.stack.push(
		-(calculator.stack.pop() as number) + 
		(calculator.stack.pop() as number)
	),
	"pop": calculator => calculator.stack.pop(),
	"dup": calculator => calculator.stack.push(topOfStack(calculator)),
	"set": calculator => {
		const value = calculator.stack.pop() as number
		const variableName = calculator.stack.pop() as string
		calculator.variables[variableName] = value	
	},
	"get": calculator => {
		const variableName = calculator.stack.pop() as string
		calculator.stack.push(calculator.variables[variableName])	
	},
}

function processOperand(calculator: Calculator, s: string) {
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