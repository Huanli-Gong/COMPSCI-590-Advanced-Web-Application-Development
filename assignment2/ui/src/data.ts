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

export async function getLists(): Promise<SignupListBasicInfo[]> {
  return (await fetch("/api/lists")).json()
}

export async function getList(listId: Id): Promise<SignupList | null> {
  return (await fetch(`/api/list/${encodeURIComponent(listId)}/participants`)).json()
}

export async function addList(name: string): Promise<Id> {
  return (await (await fetch(
    `/api/new-list`, 
    { 
      method: "POST",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ name }), 
    }
  )).json()).listId
}

export async function addParticipantToList(listId: Id, item: Omit<SignupParticipant, "id">): Promise<Id | null> {
  return (await (await fetch(
    `/api/list/${encodeURIComponent(listId)}/new-participant`, 
    { 
      method: "POST",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(item), 
    }
  )).json()).participantId
}

export async function updateParticipantOnList(listId: Id, participantId: Id, update: Partial<Omit<SignupParticipant, "id">>): Promise<number> {
  console.log(update)
  return (await (await fetch(
    `/api/list/${encodeURIComponent(listId)}/participant/${encodeURIComponent(participantId)}`, 
    { 
      method: "PUT",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(update), 
    }
  )).json()).updatedCount;
}

export async function deleteList(listId: Id): Promise<void> {
  await fetch(
    `/api/list/${encodeURIComponent(listId)}`, 
    { method: "DELETE" }
  )
}

export async function deleteParticipantOnList(listId: Id, participantId: Id): Promise<void> {
  await fetch(
    `/api/list/${encodeURIComponent(listId)}/participant/${encodeURIComponent(participantId)}`, 
    { method: "DELETE" }
  )
}