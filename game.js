// determine the first player: user or computer
var firstPlayerMe = localStorage.getItem('iStartBtnPressed') === 'true'

const userMessageText = document.getElementById("instruction-message")

// initialising players scores
let playerUser = {
    name: "Me",
    gameScore: 0,
    turnScore: 0,
    gameScoreText: document.getElementById("game-score-me-el"),
    turnScoreText: document.getElementById("turn-score"),
    turnText: document.getElementById("my-turn-btn"), 
    availableDice: 6,
    loseMes: "Oops...",
    isActive: false
}

let playerComputer = {
    name: "Computer",
    gameScore: 0,
    turnScore: 0,
    gameScoreText: document.getElementById("game-score-comp-el"),
    turnScoreText: document.getElementById("turn-score"),
    turnText: document.getElementById("comp-turn-btn"),
    availableDice: 6,
    loseMes: "Oops...",
    isActive: false
}

// initialise screen
const rollBtn = document.getElementById("roll-btn")
const endTurnBtn = document.getElementById("end-turn-btn")

rollBtn.addEventListener("click", function() {rollDice(playerUser)})
endTurnBtn.addEventListener("click", function() {endTurn(playerUser)})

if (firstPlayerMe){
    usersTurn()
} else {
    computersTurn()
}

// game functionality
function usersTurn() {
    updatePlayerTurn(playerComputer)
    playerUser.availableDice = 6
    playerUser.isActive = true
}

function computersTurn() {
    updatePlayerTurn(playerUser)
    rollBtn.disabled = true
    endTurnBtn.disabled = true
    rollBtn.style.opacity = "0.5"
    endTurnBtn.style.opacity = "0.5"
    playerComputer.availableDice = 6
    playerComputer.isActive = true
    setTimeout(() => {computerPlays()}, 1000)
}

function updateGameScores(player) {
    player.gameScore += player.turnScore
    player.gameScoreText.textContent = `${player.name}: ${player.gameScore}`
}

function updateTurnScore(player, currentScore) {
    if (currentScore===0) {
        player.turnScoreText.textContent = currentScore
        player.turnScore = currentScore
    } else {
        player.turnScoreText.textContent = player.turnScore + currentScore
        player.turnScore += currentScore
    }
}

function updatePlayerTurn(playerLast) {
    playerLast.turnText.style.color = "black"
    playerLast.turnText.style['background-color'] = "white"

    if (playerLast.name === "Me") {
        playerComputer.turnText.style.color = "white"
        playerComputer.turnText.style['background-color'] = "rgb(150, 16, 32)"
    } else {
        playerUser.turnText.style.color = "white"
        playerUser.turnText.style['background-color'] = "rgb(150, 16, 32)"
    }

}

function getRandomDiceSide() {
    return Math.floor( 1 + Math.random() * 6 )
}

function countScore(diceSet) {
    let score = 0
    let numScoringDice = 0
    const counts = {}
    for (const num of diceSet) {counts[num] = counts[num] ? counts[num] + 1 : 1}
    
    if (counts[1]===6) {
        return [500, 6]
    } else if (JSON.stringify(Object.values(counts)) === JSON.stringify([2, 2, 2])) {
        return [100, 6]
    } else if (JSON.stringify(Object.values(counts)) === JSON.stringify([1, 1, 1, 1, 1, 1])) {
        return [100, 6]
    } else if (counts[2]===6) {
        return [40, 6]
    } else if (counts[3]===6) {
        return [60, 6]
    } else if (counts[4]===6) {
        return [80, 6]
    } else if (counts[5]===6) {
        return [100, 6]
    } else if (counts[6]===6) {
        return [120, 6]
    }

    if (counts[1] >= 3) {
        score += 100 + (counts[1]-3)*10
        numScoringDice += counts[1]
    } else if (counts[1] < 3) {
        score += 10*counts[1]
        numScoringDice += counts[1]
    }

    if (counts[5] >= 3) {
        score += 50 + (counts[5]-3)*5
        numScoringDice += counts[5]
    } else if (counts[5] < 3) {
        score += 5*counts[5]
        numScoringDice += counts[5]
    }

    if (counts[2]>=3) {
        score += 20
        numScoringDice += 3
    }
    if (counts[3]>=3) {
        score += 30
        numScoringDice += 3
    }
    if (counts[4]>=3) {
        score += 40
        numScoringDice += 3
    }
    if (counts[6]>=3) {
        score += 60
        numScoringDice += 3
    }

    return [score, numScoringDice]
}

function rollDice(player)  {
    let dice = [getRandomDiceSide(), getRandomDiceSide(), getRandomDiceSide(), 
                getRandomDiceSide(), getRandomDiceSide(), getRandomDiceSide()]
    let rolledDice = []
    
    for (let i = 0; i < player.availableDice; i++) {
        document.getElementById(`dice${i+1}`).setAttribute("src", `images/dice${dice[i]}.jpg`)
        rolledDice.push(dice[i])
    }

    for (let i = player.availableDice; i < 6; i++) {
        document.getElementById(`dice${i+1}`).setAttribute("src", "images/locked_dice.png")
    }

    let [turnScore, numScoringDice] = countScore(rolledDice)
    updateTurnScore(player, turnScore)
    if (numScoringDice === 0) {
        player.availableDice = 0
    } else if (numScoringDice < 6) {
            player.availableDice -= numScoringDice
    }

    if (!(player.availableDice)) {
        rollBtn.disabled = true
        rollBtn.style.opacity = "0.5"
    }
    
    if (!(player.turnScore)) {
        userMessageText.style["padding-bottom"] = 0
        userMessageText.textContent = player.loseMes
    }

    return new Promise(resolve => setTimeout(resolve, 5500))    
}

function endTurn(player) {
    player.isActive = false
    userMessageText.textContent = ""
    userMessageText.style["padding-bottom"] = "18.5px"

    for (let i = 0; i < 6; i++) {
        document.getElementById("dice"+(i+1)).setAttribute("src", "images/locked_dice.png")
    }
    updateGameScores(player)
    player.turnScore = 0
    updateTurnScore(player, 0)

    // check if someone reached 500pt
    if (playerComputer.gameScore >= 500) {
        endGame(playerComputer)
    } else if (playerUser.gameScore >= 500) {
        endGame(playerUser)
    } else {
        // pass turn to other player
        if (player.name === "Me") {
            rollBtn.disabled = true
            endTurnBtn.disabled = true
            rollBtn.style.opacity = "0.5"
            endTurnBtn.style.opacity = "0.5"
            computersTurn()
        } else if (player.name === "Computer") {
            usersTurn()
            rollBtn.disabled = false
            endTurnBtn.disabled = false
            rollBtn.style.opacity = "1.0"
            endTurnBtn.style.opacity = "1.0"
        }
    }

    return new Promise(resolve => setTimeout(resolve, 1))
}

function computerPlays() {
    rollDice(playerComputer)
    
    async function decide() {
        while (playerComputer.isActive) {
        
            let expected_reward = 0.0
            const certain_reward = playerComputer.turnScore

            // get expected outcome
            let combination_limits = [[0, -1], [1, 6], [11, 66], [111, 666], [1111, 6666], [11111, 66666], [111111, 666666]]
            let dice_left = playerComputer.availableDice
            for (let combination = combination_limits[dice_left][0]; combination <= combination_limits[dice_left][1]; combination++) {
                if ( !(String(combination).includes("0")) && !(String(combination).includes("7")) 
                    && !(String(combination).includes("8")) && !(String(combination).includes("9"))) {
                // transform combination to dice sides
                let dice = []
                for (let i = 0; i < dice_left; i++) {
                    dice.push(parseInt(String(combination)[i]))
                }
                let score = countScore(dice)[0]
                if (score > 0) {expected_outcome = (1/6)**dice_left * (score + certain_reward)}
                else {expected_outcome = 0}
                expected_reward += expected_outcome
                }
            }
        
            if (certain_reward + playerComputer.gameScore >= 500) {
                playerComputer.isActive = false
                await endTurn(playerComputer)
            } else if (certain_reward && certain_reward < expected_reward) {
                await rollDice(playerComputer)
                //console.log(`ROLLING with ${certain_reward} and expecting ${expected_reward}`)
            } else {
                playerComputer.isActive = false
                await endTurn(playerComputer)
                //console.log(`ENDING TURN with ${certain_reward} and expecting ${expected_reward}`)
            }
        
        }
    }
    setTimeout(() => {decide()}, 5500)
}

function endGame(winner) {
    localStorage.setItem("winner", winner.name)
    rollBtn.disabled = true
    endTurnBtn.disabled = true
    rollBtn.style.opacity = "0.5"
    endTurnBtn.style.opacity = "0.5"
    window.location.href = "winner.html"
}
