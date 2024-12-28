export type StackElement = number | string

export interface Calculator {
	stack: StackElement[]
	variables: Record<string, number>
}

export function makeCalculator() {
	return <Calculator>{
		stack: [],
		variables: {},
	}
}

export function topOfStack(calculator: Calculator) {
	return calculator.stack[calculator.stack.length - 1]
}

export const operators: Record<string, (c: Calculator) => void> = {
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

export function processOperand(calculator: Calculator, s: string) {
	if (!isNaN(parseFloat(s))) {
		calculator.stack.push(parseFloat(s))
	} else if (operators[s]) {
		operators[s](calculator)
	} else {
		calculator.stack.push(s)
	}
}
