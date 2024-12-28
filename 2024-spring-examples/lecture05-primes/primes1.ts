function findPrimes(n: number) {
	const a = Array.from({ length: n + 1 }).map((_, i) => i >= 2)
	
	for (let i = 2; i <= Math.sqrt(n); i++) {
		for (let j = 2; i * j <= n; j++) {
			a[i * j] = false
		}
	}

	return a.flatMap((x, i) => x ? [i] : [])
}

console.log(findPrimes(30000000))