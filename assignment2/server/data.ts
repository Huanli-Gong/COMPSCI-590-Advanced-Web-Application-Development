import fs from "fs"

export type Id = string

export interface SignupList {
	id: Id
	name: string
	participants: SignupParticipant[]
}

export interface SignupListBasicInfo {
	id: Id
	name: string
	count: number
}

export interface SignupParticipant {
	id: string
	name: string
  reviewed: boolean
}

let signupLists: SignupList[] = []
let idCount = 0

function nextId(): Id {
	return String(idCount++)
}

export function load() {
  try {
    const data = JSON.parse(fs.readFileSync("signup-list-data.json").toString("utf-8"))
    signupLists = data.signupLists
    idCount = data.idCount
  } catch (e) {
    console.warn("load failed", e)
  }
}

export function save() {
  fs.writeFileSync("signup-list-data.json", JSON.stringify({ signupLists, idCount }, null, 2))
}

export function getLists(): SignupListBasicInfo[] {
	return signupLists.map(({ id, name, participants }) => ({ id, name, count: participants.length }))
}

export function getList(listId: Id): SignupList | null {
	return signupLists.filter(l => l.id === listId)[0] || null
}

export function addList(name: string) {
	const newList: SignupList = { id: nextId(), name, participants: [] }
	signupLists.push(newList)
  save()
	return newList.id
}

export function addParticipantToList(listId: Id, item: Omit<SignupParticipant, "id">) {
  const list = getList(listId)
  if (!list) {
    return null
  }
	const id = nextId()
	list.participants?.push({ ...item, id })
  save()
	return id
}

export function updateParticipantOnList(listId: Id, participantId: Id, update: Partial<SignupParticipant>) {
	const list = getList(listId)
	if (!list) {
		return 0
	}
  let participantsUpdated = 0
	list.participants = list.participants.map(x => {
		if (x.id === participantId) {
      ++participantsUpdated
			return { ...x, ...update }
		} else {
			return x
		}
	})
  save()
  return participantsUpdated
}

export function deleteList(listId: Id) {
  let originalLength = signupLists.length
  signupLists = signupLists.filter(l => l.id !== listId)
  save()
  return originalLength !== signupLists.length
}

export function deleteParticipantOnList(listId: Id, participantId: Id) {
  const list = getList(listId)
  if (!list) {
    return false
  }

  let originalLength = list.participants.length
  list.participants = list.participants.filter(l => l.id !== participantId)
  save()
  return originalLength !== list.participants.length
}