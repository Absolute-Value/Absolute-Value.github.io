const dataDir = "/blogs/data/";
const dataFiles = [
  "愛知県の市町村",
  "岐阜県の市町村",
  "静岡県の市町村",
  "東海道新幹線の駅",
  "山陽新幹線の駅",
  "東北新幹線の駅",
  "九州新幹線の駅",
  "北陸新幹線の駅",
  "JR東海道本線の駅",
  "名古屋市営地下鉄東山線の駅",
  "名古屋市営地下鉄名城線の駅",
  "名古屋市営地下鉄鶴舞線の駅",
  "名古屋市営地下鉄桜通線の駅",
  "名鉄名古屋本線の駅",
  "名鉄犬山線の駅",
];

document.addEventListener("DOMContentLoaded", function() {
  const selector = document.getElementById("dataFileSelector");
  dataFiles.forEach(file => {
    const option = document.createElement("option");
    option.value = file;
    option.textContent = file;
    selector.appendChild(option);
  });
});

let currentDataArray = [];
let usedDataArray = [];
let currentDataFile = "";

function loadDataFile(filename) {
  fetch(dataDir + filename + ".txt")
    .then(response => response.text())
    .then(text => {
      // 改行で分割し、空行を除去
      currentDataArray = text.split('\n').map(s => s.split('\t')[0]).map(s => s.trim()).filter(s => s.length > 0);
      usedDataArray = [];
      updateChatHistoryCount();
    });
}

function updateChatHistoryCount() {
  const chatHistory = document.getElementById("chatHistory");
  chatHistory.innerHTML = "";
  const message = document.createElement("p");
  message.textContent = `${currentDataFile}は全部で${currentDataArray.length}個あります。`;
  message.className = "assistant";
  chatHistory.appendChild(message);
}

// 初期表示時に最初のファイルを読み込む
document.addEventListener("DOMContentLoaded", function() {
  const selector = document.getElementById("dataFileSelector");
  if (selector.value) {
    currentDataFile = selector.value;
    loadDataFile(selector.value);
  }
  selector.addEventListener("change", function() {
    currentDataFile = selector.value;
    loadDataFile(selector.value);
  });
});

const sendButton = document.getElementById("sendButton");
const chatInputField = document.getElementById("chatInputField");
const chatHistory = document.getElementById("chatHistory");

function handleInput() {
  const inputValue = chatInputField.value.trim();
  if (!inputValue) return;

  const userMessage = document.createElement("p");
  userMessage.textContent = `${inputValue}`;
  userMessage.className = "user";
  chatHistory.appendChild(userMessage);

  if (inputValue === "ギブアップ") {
    const giveUpMessage = document.createElement("p");
    giveUpMessage.textContent = `答えられなかったのは`;
    for (let i = 0; i < currentDataArray.length; i++) {
      if (!usedDataArray.includes(currentDataArray[i])) {
        giveUpMessage.textContent += `${currentDataArray[i]}、`;
      }
    }
    giveUpMessage.textContent += `でした。`;
    giveUpMessage.className = "assistant";
    chatHistory.appendChild(giveUpMessage);
  }
  else if (usedDataArray.includes(inputValue)) {
    const incorrectMessage = document.createElement("p");
    incorrectMessage.textContent = "既に答えています。";
    incorrectMessage.className = "assistant";
    chatHistory.appendChild(incorrectMessage);
  } else {
    const index = currentDataArray.indexOf(inputValue);
    if (index !== -1) {
        currentDataArray.splice(index, 1);
        usedDataArray.push(inputValue);
        const correctMessage = document.createElement("p");
        if (currentDataArray.length === 0) {
            correctMessage.textContent = `全て答えました。おめでとうございます！`;
        } else {
            correctMessage.textContent = `正解。残り${currentDataArray.length}個です。`;
        }
        correctMessage.className = "assistant";
        chatHistory.appendChild(correctMessage);
    } else {
        const incorrectMessage = document.createElement("p");
        incorrectMessage.textContent = "不正解です。";
        incorrectMessage.className = "assistant";
        chatHistory.appendChild(incorrectMessage);
    }
  }
  chatInputField.value = "";
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

sendButton.addEventListener("click", function() {
  handleInput();
});

chatInputField.addEventListener("compositionend", function(e) {
  // 日本語入力の確定時には何もしない
});

chatInputField.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && !e.isComposing) {
    handleInput();
  }
});
