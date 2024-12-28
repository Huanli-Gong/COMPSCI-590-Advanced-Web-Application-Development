import http from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, filterCardsForPlayerPerspective, Card, playersWithOneOrFewerCard,Config } from "./model"

const server = http.createServer()
const io = new Server(server)
const port = 8101
let config: Config = {
  numberOfDecks: 5,
  rankLimit: 13,
}
let gameState = createEmptyGame(["player1", "player2"], config.numberOfDecks, config.rankLimit)


function emitUpdatedCardsForPlayers(cards: Card[], newGame = false) {
  gameState.playerNames.forEach((_, i) => {
    let updatedCardsFromPlayerPerspective = filterCardsForPlayerPerspective(cards, i)
    if (newGame) {
      updatedCardsFromPlayerPerspective = updatedCardsFromPlayerPerspective.filter(card => card.locationType !== "unused")
    }
    console.log("emitting update for player", i, ":", updatedCardsFromPlayerPerspective)
    io.to(String(i)).emit(
      newGame ? "all-cards" : "updated-cards", 
      updatedCardsFromPlayerPerspective,
    )
  })
}

io.on('connection', client => {
  function emitGameState() {
    client.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      playersWithOneOrFewerCard (gameState)
    )
  }
  
  console.log("New client")
  let playerIndex: number | null | "all" = null
  client.on('player-index', n => {
    playerIndex = n
    console.log("playerIndex set", n)
    client.join(String(n))
    if (typeof playerIndex === "number") {
      client.emit(
        "all-cards", 
        filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
      )
    } else {
      client.emit(
        "all-cards", 
        Object.values(gameState.cardsById),    
      )
    }
    emitGameState()
  })

  client.on("action", (action: Action) => {
    if (typeof playerIndex === "number") {
      const updatedCards = doAction(gameState, { ...action, playerIndex })
      emitUpdatedCardsForPlayers(updatedCards)
    } else {
      // no actions allowed from "all"
    }
    io.to("all").emit(
      "updated-cards", 
      Object.values(gameState.cardsById),    
    )
    io.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      playersWithOneOrFewerCard (gameState)
    )
  })

  client.on("new-game", () => {
    gameState = createEmptyGame(gameState.playerNames, config.numberOfDecks, config.rankLimit)
    const updatedCards = Object.values(gameState.cardsById)
    emitUpdatedCardsForPlayers(updatedCards, true)
    io.to("all").emit(
      "all-cards", 
      updatedCards,
    )
    io.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      playersWithOneOrFewerCard (gameState)
    )
  })

  client.on('get-config', () => {
    client.emit('get-config-reply', config);
  })

  client.on('update-config', (updatedConfig: Config) => {
    setTimeout(() => {
      if (typeof updatedConfig === 'object' && !Array.isArray(updatedConfig) && 
          'numberOfDecks' in updatedConfig && 
          !isNaN(Number(updatedConfig.numberOfDecks)) &&
          Number.isInteger(Number(updatedConfig.numberOfDecks)) &&
          Number(updatedConfig.numberOfDecks) > 0 &&
          Number(updatedConfig.numberOfDecks) <= 10 &&
          'rankLimit' in updatedConfig && 
          !isNaN(Number(updatedConfig.rankLimit)) &&
          Number.isInteger(Number(updatedConfig.rankLimit)) &&
          Number(updatedConfig.rankLimit) > 0 &&
          (updatedConfig.rankLimit) <= 13 &&
          Object.keys(updatedConfig).length === 2) 
      {
        
        config = updatedConfig
        gameState = createEmptyGame(gameState.playerNames, config.numberOfDecks, config.rankLimit)
        const updatedCards = Object.values(gameState.cardsById)
        emitUpdatedCardsForPlayers(updatedCards, true)
        io.to("all").emit(
          "all-cards",
          updatedCards,
        )
        io.emit(
          "game-state", 
          gameState.currentTurnPlayerIndex,
          gameState.phase,
          gameState.playCount,
          playersWithOneOrFewerCard (gameState)
        )
        client.emit('update-config-reply', true)
      } else {
        client.emit('update-config-reply', false)
      }
    }, 2000)
  })
})
server.listen(port)
console.log(`Game server listening on port ${port}`)
