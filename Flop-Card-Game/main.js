//MVC架構
// 設定遊戲狀態
const GAME_STATE = {
  FirstCardWaits: "FirstCardWaits",
  SecondCardWaits: "SecondCardsWaits",
  CardMatchFailed: "CardMatchFailed",
  CardMatched: "CardMatched",
  GameFinished: "GameFinished",
}
// 宣告Controller來控制遊戲狀態
const controller = {
  currentState: GAME_STATE.FirstCardWaits,
  // 因為要統一使用controller來派發view或model，因此避免view暴露在global區域裡
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) { //若不包含back則跳回,代表若牌不是蓋上的則跳回
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardWaits: // 宣告第一個狀態要做的事情
        view.flipCards(card) // 翻一張牌
        model.revealedCards.push(card) // 將牌的資料存進model裡
        this.currentState = GAME_STATE.SecondCardWaits // 改變狀態為等待翻第二張牌
        break
      case GAME_STATE.SecondCardWaits: // 宣告第二個狀態要做的事情
        view.renderTriedTimes(++model.triedTimes) // 不管配對成功與否，次數+1
        view.flipCards(card) // 翻一張牌
        model.revealedCards.push(card) // 將第二張牌的資料存進model裡
        // 情境判斷:比較兩張牌是否相等
        if (model.isRevealedCardsMatched()) { // 如果為ture 
          this.currentState = GAME_STATE.CardMatched // 更改遊戲狀態
          view.renderScore(model.score += 10) // 配對成功加10分
          view.pairCards(...model.revealedCards) // 將兩張牌做改變，讓使用者知道配對成功
          model.revealedCards = [] // 清空存放牌的空間
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardWaits  // 再次修改遊戲狀態
        } else {
          this.currentState = GAME_STATE.CardMatchFailed // 更改遊戲狀態
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards) // 將兩張牌覆蓋回去
    model.revealedCards = [] // 清空存放牌的空間
    controller.currentState = GAME_STATE.FirstCardWaits // 這邊不能使用this.currentState 要用 controller.currentState
    // 當我們把 resetCards 當成參數傳給 setTimeout 時，this 的對象變成了 setTimeout
  }
}

// 宣告Model來集中管理資料
const model = {
  revealedCards: [], //是一個暫存牌組，使用者每次翻牌時，就先把卡片丟進這個牌組，當兩張牌時就檢查配對是否成功，檢查完不論配對是否成功，這個暫存牌組都要清空

  // 判斷被存入revealedCards內的兩張牌是否相等
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 //利用餘數判斷兩張牌是否一樣 0%13 = 0, 1%13 = 1 .... 並且會回傳布林值 0 or 1
  },
  score: 0,
  triedTimes: 0
}

// 宣告變數
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
// 負責產生卡片內容
const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent(index) {
    // const number = (index % 13) + 1 // index:0~51 餘數為0~12 +1 = 1~13(即撲克牌數字)
    const number = this.transformNumber((index % 13) + 1) // 改寫上式，運算時順便轉換1 11 12 13  // 呼叫view.transformNumber()
    const symbol = Symbols[Math.floor(index / 13)] // 用math.floor取index/13整數[0,1,2,3]來亂數決定花色
    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>
    `
  },
  // 處理撲克牌數字1 11 12 13轉換成 A J Q K
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A"
      case 11:
        return "J"
      case 12:
        return "Q"
      case 13:
        return "K"
      default:
        return number
    }
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards")
    // rootElement.innerHTML = this.getCardElement(32) //view.getCardElement()
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join("")
    // Array(52)會產生一個[0~51]的陣列
    // Array.keys()拿出0~51的迭代器
    // Array.from 可以從類似陣列的物件來建立新的陣列
    // 用 map 迭代陣列，並依序將數字(index)丟進 view.getCardElement()，會變成有 52 張卡片的"陣列"；
    // 用 join("") 把陣列合併成一個大字串，才能當成 HTML template 來使用，innerHTML只能搭配字串使用
  },
  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      card.classList.add('back')

      card.innerHTML = null
    })
  },
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add("paired")
    })
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`
  },
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true }) //once: true是要求在事件執行一次之後，就要卸載這個監聽器。
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}


const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(52).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
      // 解構賦值: 只要等號兩邊的模式相同 (例如都是 [] 或都是 {})，左邊的變數就會被賦予右邊的對應值。
      // let a = 1
      // let b = 2
      // let c = 3
      // 等同於 let [a, b, c] = [1, 2, 3]
    }
    return number
  }
}

// view.displayCards()
controller.generateCards() // 取代 view.displayCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener("click", event => {
    controller.dispatchCardAction(card)
  })
})
// const number = [0, 1, 2, 3, 4, 5, 6]
// for (let index = number.length - 1; index > 0; index--) {
//   console.log(index)
//   console.log(number[index])
//   let randomIndex = Math.floor(Math.random() * (index + 1));
//   console.log(randomIndex)
//   console.log(number[randomIndex])
//     ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
//   console.log(number)
// }
