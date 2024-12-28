////////////////////////////////////////////////////////////////////////////////////////////

import { Hint } from "mongodb"

// Constants
export const SHAPES = ["Tilde", "Oval", "Diamond"]
export const COLORS = ["Purple", "Red", "Green"]
export const SHADINGS = ["Solid", "Stripes", "Blank"]
export const NUMBERS = ["1", "2", "3"]

export type CardId = string
export type LocationType = "on-deck" | "on-table" | "used"

const cardsById_fake: Record<CardId, Card> = {}

// Card Model
export class Card {
    id: CardId
    number: typeof NUMBERS[number]
    shape: typeof SHAPES[number]
    color: typeof COLORS[number]
    shading: typeof SHADINGS[number]
    locationType: LocationType
    imgSrc: string

    constructor(id: CardId, number: typeof NUMBERS[number], shape: typeof SHAPES[number], color: typeof COLORS[number], shading: typeof SHADINGS[number], location: LocationType = "on-deck") {
        if (!SHAPES.includes(shape) || !COLORS.includes(color) || !SHADINGS.includes(shading) || !NUMBERS.includes(number)) {
            throw new Error("Invalid card properties")
        }

        this.id = id
        this.number = number
        this.shape = shape
        this.color = color
        this.shading = shading
        this.locationType = location
        this.imgSrc = `images/${shading}${color}${shape}${number}.jpg`
    }
}

// Deck Model
export class Deck {
    cards: Card[]

    constructor(cardsById: Record<CardId, Card> = cardsById_fake, numberOfDecks: number = 1, cards: Card[] = []) {
        if (cards.length > 0) {
            this.cards = cards
        } else {
        this.cards = []
        this.createDeck(cardsById, numberOfDecks)
        this.shuffleCards()
        }
    }

    createDeck(cardsById: Record<CardId, Card>, numberOfDecks: number) {
        let cardId = 0
        for (let i = 0; i < numberOfDecks; i++) {
            NUMBERS.forEach((number) => {
                SHAPES.forEach((shape) => {
                    COLORS.forEach((color) => {
                        SHADINGS.forEach((shading) => {
                            let card = new Card(String(cardId++), number, shape, color, shading)
                            this.cards.push(card)
                            cardsById[card.id] = card
                        })
                    })
                })
            })
        }
    }

    drawCard(): Card | null {
        if (this.cards.length > 0) {
            const card = this.cards.pop()
            card.locationType = "on-table"
            return card
        }
        return null
    }

    shuffleCards(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = this.cards[i]
            this.cards[i] = this.cards[j]
            this.cards[j] = temp
        }
    }

    isEmpty(): boolean {
        return this.cards.length === 0
    }
}

// Player Model
export class Player {
    score: number
    PlayerId: number
    name: string
    constructor(PlayerId: number, name: string, score: number = 0) {
        this.score = score
        this.PlayerId = PlayerId
        this.name = name
    }

    increaseScore(score: number): void {
        this.score += score
    }
}

export interface ScoreHistory {
    level: number,
    win: number,
    loss: number
}

export interface AuthenticatedPlayer {
    _id: string
    name: string
    preferred_username: string
    nickname: string
    email: string
    preferredLevel: number
    scoreHistory: ScoreHistory[]
}

// Table Model
export class Table {
    cards: Card[]

    constructor(deck: Deck = new Deck(), cards: Card[] = [],tableSize:number=12) {
        if (cards.length > 0) {
            this.cards = cards
        }
        else{
            this.cards = []
            this.populateTable(deck, tableSize)
        }
       
    }

    populateTable(deck: Deck, count: number): void {
        while (this.cards.length < count && !deck.isEmpty()) {
            const card = deck.drawCard()
            if (card) {
                this.cards.push(card)
            }
        }
    }

    replaceUsedCards(deck: Deck, usedCards: Card[],tableSize: number): void {
        const usedCardIds = new Set(usedCards.map(card => card.id))
        this.cards = this.cards.filter(card => !usedCardIds.has(card.id))
        this.populateTable(deck, tableSize)
    }

    size(): number {
        return this.cards.length
    }

    tableAdd(cardNew: Card): void {
        this.cards.push(cardNew)
    }

    isEmpty(): boolean {
        return this.cards.length === 0
    }

    shuffleTable(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = this.cards[i]
            this.cards[i] = this.cards[j]
            this.cards[j] = temp
        }
    }

}

/**
 * Checks to to see if the card attributes are all equal or not
 */
export function check(a: string, b: string, c: string) {
    return (a === b && a === c) || (a !== b && a !== c && b !== c)
}

/**
 * Given the user selected cards, calls check to see if they are all equal or not
 */
export function verifySet(cards: Card[], levels: number) {
    if (cards.length !== 3) {
        return false
    }
    const card1 = cards[0]
    const card2 = cards[1]
    const card3 = cards[2]
    let result = check(card1.number, card2.number, card3.number)
    if (levels > 1) {
        result = result && check(card1.shape, card2.shape, card3.shape)
    }
    if (levels > 2) {
        result = result && check(card1.color, card2.color, card3.color)
    }
    if (levels > 3) {
        result = result && check(card1.shading, card2.shading, card3.shading)
    }
    return result
}

////////////////////////////////////////////////////////////////////////////////////////////
// Game Phase
export type GamePhase = "play" | "game-over"

export interface GameState {
    players: Player[]
    cardsById: Record<CardId, Card>
    deck: Deck
    table: Table
    currentTurnPlayerIndex: number
    phase: GamePhase
    playCount: number
    level: number
    targetScore: number
    tableSize: number
}

export interface Config {
    numberOfDecks: number
    level: number
    targetScore: number
    tableSize: number
}

/**
 * creates an empty GameState in the initial-card-dealing state
 */
export function createEmptyGame(playerNames: string[], level: number = 1, number: number = 1, targetScore = 5, tableSize =12): GameState {
    const cardsById: Record<CardId, Card> = {}
    let deck = new Deck(cardsById, number)
    let table = new Table(deck,[],tableSize)
    let players = []
    for (let i = 0; i < playerNames.length; i++) {
        players.push(new Player(i, playerNames[i]))
    }

    return {
        players,
        cardsById,
        deck,
        table,
        currentTurnPlayerIndex: 0,
        phase: "play",
        playCount: 0,
        level: level,
        targetScore: targetScore,
        tableSize:tableSize
    }
}

/**
 * Determines if someone has won the game -- i.e., has no cards left on-table or unused
 */
export function determineWinner(state: GameState) {
    if (!state.deck.isEmpty()) {
        return null // Winner not determined
    }

    let scores: number[] = []
    state.players.forEach((player, index) => {
        scores.push(player.score)
    })
    const maxScore = Math.max(...scores)
    const maxScoringPlayerIndices: number[] = []

    scores.forEach((score, index) => {
        if (score === maxScore) {
            maxScoringPlayerIndices.push(index)
        }
    })

    const playerIndex = maxScoringPlayerIndices.indexOf(0)
    return playerIndex === -1 ? null : playerIndex
}

////////////////////////////////////////////////////////////////////////////////////////////
// player actions
export interface DrawCardAction {
    action: "draw-card"
    playerIndex: number
}

export interface SelectCardsAction {
    action: "select-cards"
    playerIndex: number
    inputCards: Card[]
}

export interface HintAction {
    action: "get-hint"
    playerIndex: number
}

export interface passAction {
    action: "pass"
    playerIndex: number
}

export function hint(tableCards:Card[], level:number=1){
    for (let i = 0; i<tableCards.length; i++) {
        for (let j = i+1; j<tableCards.length; j++) {
            for (let k = j+1; k<tableCards.length; k++) {
                if (verifySet([tableCards[i],tableCards[j],tableCards[k]],level)){
                    return "Try making a set with card "+ i +" and "+ j
                }
            }
        }
    }
    return "There is no set on the table"
}

export type Action = DrawCardAction | SelectCardsAction | HintAction | passAction

function moveToNextPlayer(state: GameState) {
    state.currentTurnPlayerIndex = (state.currentTurnPlayerIndex + 1) % state.players.length
}

function addCards(state: GameState) {
    if (!state.deck.isEmpty()) {
        for (let i = 0; i < 3; i++) {
            state.table.tableAdd(state.deck.cards.shift())
        }
    }
}

function checkGameOver(state: GameState): boolean{
    let result = false
    if (state.players[state.currentTurnPlayerIndex].score>=state.targetScore){
        state.phase = "game-over"
        result = true
    }
    else if (determineWinner(state) != null) {
        state.phase = "game-over"
        result = true
    }
    ++state.playCount
    return result
}

function findCardById(table: Table, cardId: CardId): Card | undefined {
    return table.cards.find(card => card.id === cardId)
}

/**
 * updates the game state based on the given action
 * @returns whether or not the player found a set && related message content
 */
export function doAction(state: GameState, action: Action): { changed: boolean, message: string } {

    // Check whether the game is over
    if (state.phase === "game-over") {
        return { changed: false, message: "Game is already over." }
    }
    // Check whether it is the player's turn
    if (action.playerIndex !== state.currentTurnPlayerIndex) {
    // if (action.playerIndex !== state.currentTurnPlayerIndex && action.playerIndex !== -1) {
        return { changed: false, message: "It's not your turn." }
    }

    if (action.action === "draw-card") {
        addCards(state)
        return { changed: true, message: "add 3 cards to table" }
    }

    if (action.action === "pass") {
        moveToNextPlayer(state)
        return { changed: false, message: "pass to next player" }
    }

    if (action.action === "get-hint") {
        if (state.players[state.currentTurnPlayerIndex].score>0){
            state.players[state.currentTurnPlayerIndex].score-=1
            return { changed: false, message: hint(state.table.cards, state.level) }
        }else{
            return { changed: false, message: "not enough score to get hint"}
        }
    }

    // Allow the player to select cards
    if (action.action === "select-cards") {
        // MUST have three cards
        if (action.inputCards.length !== 3) {
            return { changed: false, message: "You must select exactly three cards." }
        }

        // Check whether the three cards form a set 
        // const cards = action.inputCards.map(id => findCardById(state.table, id))
        const cards = action.inputCards
        if (verifySet(cards, state.level)) {
            state.players[state.currentTurnPlayerIndex].increaseScore(state.level)
            cards.forEach(card => card.locationType = "used") // Card discarded
            // console.log(cards)
            state.table.replaceUsedCards(state.deck, cards,state.tableSize) // Fill the table
            if (checkGameOver(state)){
                return { changed: false, message: "Game over! You win!" }
            } else{
                moveToNextPlayer(state)
                return { changed: true, message: "Set is valid! +1 point." }
            }
        } else {
            moveToNextPlayer(state)
            return { changed: false, message: "Set is not valid. No points awarded." }
        }
    }
    return { changed: false, message: "Unknown action." }
}

export function formatCard(card: Card) {
    let paddedCardId = card.id
    while (paddedCardId.length < 3) {
        paddedCardId = " " + paddedCardId
    }
    return `[${paddedCardId}] ${card.number}${card.color}${card.shading}${card.shape}`
}

export function printState({ deck, table, players, currentTurnPlayerIndex, phase, playCount }: GameState) {
    players.forEach((player, playerIndex) => {
        console.log(`${player.name}: ${player.score} ${playerIndex === currentTurnPlayerIndex ? ' *TURN*' : ''}`)
    })
}