// based on https://stackoverflow.com/a/77107457

const decoder = new TextDecoder()

export async function* getIterableStream(
  body: ReadableStream<Uint8Array>
): AsyncIterable<string> {
  const reader = body.getReader()

  while (true) {
    const { value, done } = await reader.read()
    if (done) {
      break
    }

    const decodedChunk = decoder.decode(value, { stream: true })
    yield decodedChunk
  }
}

export async function generateStream(fetchResponse: Response): Promise<AsyncIterable<string>> {
  if (fetchResponse.status !== 200) {
    throw new Error(fetchResponse.status.toString())
  }
  if (!fetchResponse.body) {
    throw new Error("the response is missing a body")
  }
  
  return getIterableStream(fetchResponse.body)
}
