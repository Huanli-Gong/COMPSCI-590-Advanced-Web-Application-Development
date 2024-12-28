export interface ContactCard {
  firstName: string
  lastName: string
  email: string
  birthday: string
}

export const blankCard: ContactCard = { 
  firstName: "", 
  lastName: "", 
  email: "", 
  birthday: "",
}

export const sampleCards: ContactCard[] = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@notreal.cs.duke.edu",
    birthday: "1900-01-01",
  },
  {
    firstName: "Wei",
    lastName: "Zhang",
    email: "wei.zhang@notreal.cs.duke.edu",
    birthday: "1990-01-01",
  },
]

export function cloneCard(x: ContactCard) {
  // only works because ContactCard fields are only one level deep (i.e., no embedded objects or arrays)
  // in general, a common way to do a deep clone is JSON.parse(JSON.stringify(x))
  return { ... x }
}

export function areCardsEquivalent(x: ContactCard, y: ContactCard) {
  // only works because ContactCard objects are constructed with fields in a certain order
  // see: https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order
  // otherwise, would need to use some sort of canonicalizing serializer
  return JSON.stringify(x) === JSON.stringify(y)
}
