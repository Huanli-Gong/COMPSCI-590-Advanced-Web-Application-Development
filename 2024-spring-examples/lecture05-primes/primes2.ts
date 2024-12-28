const eventQueue = [] as (() => void)[]

function findPrimes(n: number, callback: (x: number[]) => void) {
	const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)

	for (let i = 2; i <= Math.sqrt(n); i++) {
		eventQueue.push(() => {
			for (let j = 2; i * j <= n; j++) {
				a[i * j] = false
			}
		})
	}

	eventQueue.push(() => {
		callback(a.flatMap((x, i) => x ? [i] : []))
	})
}

findPrimes(30000000, x => console.log(x))
while (eventQueue.length) {
	eventQueue.shift()!()
}
