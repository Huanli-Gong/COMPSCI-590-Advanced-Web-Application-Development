incrementBy = 1

def makeCounter(name):
	counter = 0
	def tmp():
		nonlocal counter
		global incrementBy
		print(f"{name} incrementBy: {incrementBy} -> {incrementBy + 1}")
		incrementBy += 1
		print(f"{name} counter: {counter} -> {counter + incrementBy}")
		counter += incrementBy
	return tmp

counterA = makeCounter("a")
counterB = makeCounter("b")

print("counterA()")
counterA()
print("\ncounterB()")
counterB()
print("\ncounterA()")
counterA()
print("\ncounterB()")
counterB()
