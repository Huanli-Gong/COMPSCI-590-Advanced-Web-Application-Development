<template>
  <div class="mx-3 my-3">
    <h1>LLM Chat with <code>{{ model }}</code></h1>
    <b-list-group style="height: calc(100vh - 15rem); overflow-y: auto">
      <transition-group name="list">
        <b-list-group-item
          v-for="m, i in messages"
          :key="i"
          class="d-flex"
          :class="m.role"
        >
          <b-avatar class="mr-3">{{ iconMapping[m.role] }}</b-avatar>
          <div>
            <div v-if="m.generating"><b-icon-three-dots animation="cylon" font-scale="4" /></div>
            {{ m.content }}
          </div>
        </b-list-group-item>
      </transition-group>
    </b-list-group>
    <b-form-textarea v-model="draft" :disabled="generating" class="mb-3" ref="draftTextArea" />
    <b-button @click="sendMessage">Send</b-button>
  </div>
</template>

<style scoped>
/* based on https://vuejs.org/guide/built-ins/transition-group */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

.list-enter-from.user,
.list-leave-to.user {
  transform: translateX(100%);
}

.list-enter-from.assistant,
.list-leave-to.assistant {
  transform: translateX(-100%);
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { generateStream } from './utilities'

interface Message {
  role: "user" | "assistant"
  content: string
  generating?: boolean
}

// change the following to use a different model
// see https://ollama.com/library
const model = ref(
  "phi"
  // "mistral:7b-instruct-q2_K"
)

const draft = ref("")
const generating = ref(false)
const messages = ref([] as Message[])
const iconMapping = {
  user: "🧑",
  assistant: "🤖",
}

// set focus to the text area on load
const draftTextArea = ref(null as any)
onMounted(() => draftTextArea.value.focus())

async function sendMessage() {
  generating.value = true

  try {
    let stream: AsyncIterable<string> | null = null

    try {
      messages.value.push({ content: draft.value, role: "user" })
      messages.value.push({ content: "", role: "assistant", generating: true })
      const response = await fetch(
        "/api/chat", 
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: model.value,
            messages: messages.value,
          })
        }
      )

      stream = await generateStream(response)
      draft.value = ""
    } catch (e) {
      alert(`Error! Are you sure you ran \`ollama pull ${model.value}\` first?\n\n${e}`)
      messages.value.pop()
      return
    }

    for await (const chunk of stream) {
      for (const s of chunk.split("\n")) {
        if (s.trim().length === 0) {
          continue
        }
        console.log("chunk", s)
        messages.value[messages.value.length - 1].content += JSON.parse(s).message.content
      }
    }
    messages.value[messages.value.length - 1].generating = false
  } finally {
    generating.value = false
  }
}
</script>