// テトリスのフィールドのサイズ
const FIELD_ROWS = 20;
const FIELD_COLS = 10;

// テトリスのブロックの種類
const BLOCK_TYPE = [
  [
    [1, 1, 1, 1],
  ],
  [
    [2, 2, 0],
    [0, 2, 2],
  ],
  [
    [0, 3, 3],
    [3, 3, 0],
  ],
  [
    [4, 0, 0],
    [4, 4, 4],
  ],
  [
    [0, 0, 5],
    [5, 5, 5],
  ],
  [
    [0, 6, 0],
    [6, 6, 6],
  ],
  [
    [7, 7],
    [7, 7],
  ]
];

const COLORS = ["White", "SkyBlue", "Red", "Green", "Blue", "Orange", "Purple", "Yellow"];

// テトリスのフィールドの要素
let fieldElem = document.getElementById("field");
let nextElem  = document.getElementById("next");
let scoreElem = document.getElementById("score");
let levelElem = document.getElementById("level");

// テトリスのフィールドのコンテキスト
let ctx = fieldElem.getContext("2d");
let ctx2 = nextElem.getContext("2d");

// テトリスのフィールド
let field = [];

// テトリスの現在のブロック
let currentBlock = null;
let nextBlock = null;

// テトリスの現在のブロックの座標
let currentX = 0;
let currentY = 0;

// テトリスの現在のブロックの回転角度
let currentRotation = 0;
let nextRotation = 0;

// テトリスのスコア
let score = 0;

// テトリスのレベル
let level = 1;

let delayCount = 0;

// テトリスのゲームを初期化する
function initField() {
  // テトリスのフィールドを初期化する
  for (let y = 0; y < FIELD_ROWS; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_COLS; x++) {
      field[y][x] = 0;
    }
  }

  nextBlock = null;
  score = 0; // テトリスのスコアを初期化する
  level = 1; // テトリスのレベルを初期化する
}

// テトリスの新しいブロックを生成する
function createBlock() {
  if (nextBlock == null) {
    let id = Math.floor(Math.random() * BLOCK_TYPE.length);
    nextBlock = BLOCK_TYPE[id];

    // テトリスの新しいブロックの回転角度をランダムに選ぶ
    let rotation = Math.floor(Math.random() * 4);
    for (let c=0; c<rotation; c++) {
      nextBlock = rotateRight(nextBlock)
    }
  }
  currentBlock = nextBlock;
  currentRotation = nextRotation;
  // テトリスの新しいブロックをランダムに選ぶ
  id = Math.floor(Math.random() * BLOCK_TYPE.length);

  // テトリスの現在のブロックを設定する
  nextBlock = BLOCK_TYPE[id];

  // テトリスの新しいブロックの回転角度をランダムに選ぶ
  rotation = Math.floor(Math.random() * 4);
  for (let c=0; c<rotation; c++) {
    nextBlock = rotateRight(nextBlock)
  }

  // テトリスの現在のブロックの座標を設定する
  currentX = Math.floor(FIELD_COLS / 2) - 1;
  currentY = 0;
}

// テトリスのブロックを落下させる
function dropBlock() {
  // テトリスのブロックが着地している場合は、処理を終了する
  if (isBlockLocked()) {
    return;
  }

  // テトリスの現在のブロックの座標を下に移動する
  currentY++;
}

// テトリスのブロックを右に移動する
function moveRight() {
  // テトリスのブロックが右端に達している場合は、処理を終了する
  if (isBlockAtRightEdge()) {
    return;
  }

  // テトリスの現在のブロックの座標を右に移動する
  currentX++;
}

// テトリスのブロックを左に移動する
function moveLeft() {
  // テトリスのブロックが左端に達している場合は、処理を終了する
  if (isBlockAtLeftEdge()) {
    return;
  }

  // テトリスの現在のブロックの座標を左に移動する
  currentX--;
}

// テトリスのブロックを回転させる
function rotateRight(block) {
  // テトリスの現在のブロックの回転角度を更新する
  const ROW = block.length;
  const COL = block[0].length;
  const row = ROW-1;
  let a = [];//new Array(COL);
  for (let c=0; c<COL; c++) {
    a[c] = [];//new Array(ROW);
    for (let r=0; r<ROW; r++) {
      a[c][r] = block[row-r][c];
    }
  }
  return a;
}

function rotateLeft(block) {
  // テトリスの現在のブロックの回転角度を更新する
  const ROW = block.length;
  const COL = block[0].length;
  const col = COL-1;
  let a = [];//new Array(COL);
  for (let c=0; c<COL; c++) {
    a[c] = [];//new Array(ROW);
    for (let r=0; r<ROW; r++) {
      a[c][r] = block[r][col-c];
    }
  }
  return a;
}

// テトリスのブロックがフィールドの右端にいるかどうかを判定する
function isBlockAtRightEdge() {
  // テトリスの現在のブロックがフィールドの右端にいるかどうかを判定する
  for (let y = 0; y < currentBlock.length; y++) {
    for (let x = 0; x < currentBlock[y].length; x++) {
      // テトリスの現在のブロックの指定した位置にブロックが存在しない場合は、次の位置を処理する
      if (currentBlock[y][x] == 0) {
        continue;
      }

      // テトリスの現在のブロックがフィールドの右端にいる場合は、trueを返す
      if (currentX + x >= FIELD_COLS - 1) {
        return true;
      }
    }
  }

  // テトリスの現在のブロックがフィールドの右端にいない場合は、falseを返す
  return false;
}

// テトリスのブロックがフィールドの左端にいるかどうかを判定する
function isBlockAtLeftEdge() {
  // テトリスの現在のブロックがフィールドの左端にいるかどうかを判定する
  for (let y = 0; y < currentBlock.length; y++) {
    for (let x = 0; x < currentBlock[y].length; x++) {
      // テトリスの現在のブロックの指定した位置にブロックが存在しない場合は、次の位置を処理する
      if (currentBlock[y][x] == 0) {
        continue;
      }

      // テトリスの現在のブロックがフィールドの左端にいる場合は、trueを返す
      if (currentX + x <= 0) {
        return true;
      }
    }
  }

  // テトリスの現在のブロックがフィールドの左端にいない場合は、falseを返す
  return false;
}

// テトリスの現在のブロックが着地しているかどうかを判定する
function isBlockLocked() {
  // テトリスの現在のブロックがフィールドの下端に達している場合は、trueを返す
  if (currentY + currentBlock.length >= FIELD_ROWS) {
    return true;
  }

  // テトリスの現在のブロックが他のブロックと重なっている場合は、trueを返す
  for (let y = 0; y < currentBlock.length; y++) {
    for (let x = 0; x < currentBlock[y].length; x++) {
      // テトリスの現在のブロックの指定した位置にブロックが存在しない場合は、次の位置を処理する
      if (currentBlock[y][x] == 0) {
        continue;
      }

      // テトリスの現在のブロックがフィールドの範囲外にある場合は、trueを返す
      if (currentY + y >= FIELD_ROWS) {
        return true;
      }

      // テトリスの現在のブロックが他のブロックと重なっている場合は、trueを返す
      if (field[currentY + y + 1][currentX + x] != 0) {
        return true;
      }
    }
  }

  // テトリスの現在のブロックがフィールドの下端に達していない、または他のブロックと重なっていない場合は、falseを返す
  return false;
}

// テトリスのフィールドを描画する
function renderField() {
  // テトリスのフィールドをクリアする
  ctx.clearRect(0, 0, fieldElem.width, fieldElem.height);
  scoreElem.innerHTML = score;
  levelElem.innerHTML = level;

  // テトリスのフィールドを描画する
  for (let y = 0; y < FIELD_ROWS; y++) {
    for (let x = 0; x < FIELD_COLS; x++) {
      // テトリスのフィールドの指定した位置にブロックが存在する場合
      // if (field[y][x]) {
        // テトリスのブロックを描画する
      ctx.fillStyle = COLORS[field[y][x]];
      ctx.fillRect(x * 20, y * 20, 20, 20);
      ctx.fillStyle = "#eee"
      ctx.fillRect(x * 20, y * 20, 20, 1);
      ctx.fillRect(x * 20, y * 20, 1, 20);
      // }
    }
  }

  // テトリスの現在のブロックを描画する
  if (currentBlock) {
    for (let y = 0; y < currentBlock.length; y++) {
      for (let x = 0; x < currentBlock[y].length; x++) {
        // テトリスの現在のブロックの指定した位置にブロックが存在する場合
        if (currentBlock[y][x]) {
          // テトリスの現在のブロックを描画する
          ctx.fillStyle = COLORS[currentBlock[y][x]];
          ctx.fillRect((currentX + x) * 20, (currentY + y) * 20, 20, 20);
          ctx.fillStyle = "#eee"
          ctx.fillRect((currentX + x) * 20, (currentY + y) * 20, 20, 1);
          ctx.fillRect((currentX + x) * 20, (currentY + y) * 20, 1, 20);
        }
      }
    }
  }
}

function renderNext() {
  ctx2.clearRect(0, 0, nextElem.width, nextElem.height);

  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx2.fillStyle = "white";
      ctx2.fillRect(x * 20, y * 20, 20, 20);
      ctx2.fillStyle = "#eee"
      ctx2.fillRect(x * 20, y * 20, 20, 1);
      ctx2.fillRect(x * 20, y * 20, 1, 20);
    }
  }

  // 次のテトリスを描画する
  for (let y = 0; y < nextBlock.length; y++) {
    for (let x = 0; x < nextBlock[y].length; x++) {
      // 次のフィールドの指定した位置にブロックが存在する場合
      if (nextBlock[y][x]) {
        // テトリスのブロックを描画する
        ctx2.fillStyle = COLORS[nextBlock[y][x]];
        ctx2.fillRect(x * 20, y * 20, 20, 20);
        ctx2.fillStyle = "#eee"
        ctx2.fillRect(x * 20, y * 20, 20, 1);
        ctx2.fillRect(x * 20, y * 20, 1, 20);
      }
    }
  }
}

// テトリスの現在のブロックをフィールドに設定する
function lockBlock() {
  // テトリスの現在のブロックをフィールドに設定する
  for (let y = 0; y < currentBlock.length; y++) {
    for (let x = 0; x < currentBlock[y].length; x++) {
      // テトリスの現在のブロックの指定した位置にブロックが存在する場合
      if (currentBlock[y][x]) {
        // テトリスのフィールドの指定した位置にブロックを設定する
        field[currentY + y][currentX + x] = currentBlock[y][x];
      }
    }
  }

  // テトリスのスコアを更新する
  score += 10;
}

// テトリスのゲームを開始する
function start() {
  // テトリスのフィールドを初期化する
  initField();

  // テトリスの新しいブロックを生成する
  createBlock();

  // テトリスのゲームを更新する
  animationFrameId = setInterval(update, 1);
}

// テトリスのゲームを停止する
function stop() {
  // テトリスのゲームを停止する
  clearInterval(animationFrameId);
}

function restart() {
  stop()
  start()
}

function dropFunc(num = 1) {
  delayCount = 0;
  for (let i = 0; i < num; i++) {
    // テトリスのブロックを落下させる
    dropBlock();

    // テトリスのブロックが着地している場合
    if (isBlockLocked()) {
      // テトリスのゲームが終了している場合は、処理を終了する
      if (currentX == Math.floor(FIELD_COLS / 2) - 1 && currentY == 0) {
        clearInterval(animationFrameId);
      }

      // テトリスの現在のブロックをフィールドに設定する
      lockBlock();

      // テトリスのフィールドを消去する
      clearLines();

      // テトリスの新しいブロックを生成する
      createBlock();
      break;
    }
  }
}

// テトリスのゲームを更新する
function update() {
  // テトリスのフィールドを描画する
  renderField();
  renderNext();

  delayCount++;
  if (delayCount > 300/level+10) {
    dropFunc()
  }
}

// テトリスのフィールドを消去する
function clearLines() {
  // テトリスのフィールドから消去する行の数
  let clearLines = 0;

  // テトリスのフィールドを消去する
  for (let y = 0; y < FIELD_ROWS; y++) {
  // テトリスのフィールドの指定した行が埋まっている場合
    if (field[y].every(block => block != 0)) {
      // テトリスのフィールドの指定した行を消去する
      field.splice(y, 1);

      // テトリスのフィールドの指定した行を上に詰める
      field.unshift(Array(FIELD_COLS).fill(0));

      // テトリスのフィールドから消去する行の数をインクリメントする
      clearLines++;
    }
  }

  // テトリスのスコアを更新する
  if (clearLines > 0) {
  score += clearLines * clearLines * 100;
  }

  // テトリスのレベルを更新する
  level = Math.floor(score / 1000) + 1;
}

// テトリスのゲームを開始する
start();

// テトリスのキーイベントを処理する
document.addEventListener("keydown", event => {
  // テトリスのキーイベントを処理する
  switch (event.key) {
    // テトリスのブロックを一気に落下させる場合
    case "w":
      dropFunc(FIELD_ROWS);
      break;
    // テトリスのブロックを右に移動する場合
    case "d":
      moveRight();
      break;

    // テトリスのブロックを左に移動する場合
    case "a":
      moveLeft();
      break;

    // テトリスのブロックを下に移動する場合
    case "s":
      dropFunc();
      break;

    // テトリスのブロックを回転させる場合
    case "m":
      currentBlock = rotateRight(currentBlock);
      break;

    // テトリスのブロックを回転させる場合
    case "n":
      currentBlock = rotateLeft(currentBlock);
      break;

    // テトリスのゲームを停止する場合
    case "Escape":
      stop();
      break;

    // テトリスのゲームを再開する場合
    case "Enter":
      restart();
      break;
  }
});