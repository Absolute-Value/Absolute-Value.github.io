// テトリスのフィールドのサイズ
const FIELD_ROWS = 20;
const FIELD_COLS = 10;

// テトリスのブロックの種類
const BLOCK_TYPE = [
  [
    [1, 1, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
  ],
  [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
  ],
];

// テトリスのフィールドの要素
let fieldElem = document.getElementById("field");

// テトリスのフィールドのコンテキスト
let ctx = fieldElem.getContext("2d");

// テトリスのフィールド
let field = [];

// テトリスの現在のブロック
let currentBlock = null;

// テトリスの現在のブロックの座標
let currentX = 0;
let currentY = 0;

// テトリスの現在のブロックの回転角度
let currentRotation = 0;

// テトリスのゲームオーバーかどうか
let isGameOver = false;

// テトリスのスコア
let score = 0;

// テトリスのレベル
let level = 1;

// テトリスのゲームを初期化する
function initField() {
  // テトリスのフィールドを初期化する
  for (let y = 0; y < FIELD_ROWS; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_COLS; x++) {
      field[y][x] = 0;
    }
  }

  // テトリスのゲームオーバーを解除する
  isGameOver = false;

  // テトリスのスコアを初期化する
  score = 0;
}

// テトリスの新しいブロックを生成する
function createBlock() {
  // テトリスの新しいブロックをランダムに選ぶ
  let blockType = BLOCK_TYPE[Math.floor(Math.random() * BLOCK_TYPE.length)];

  // テトリスの現在のブロックを設定する
  currentBlock = blockType;

  // テトリスの現在のブロックの座標を設定する
  currentX = Math.floor(FIELD_COLS / 2) - 1;
  currentY = 0;

  // テトリスの現在のブロックの回転角度を初期化する
  currentRotation = 0;
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

// テトリスのブロックがフィールドの右端にいるかどうかを判定する
function isBlockAtRightEdge() {
  // テトリスの現在のブロックがフィールドの右端にいるかどうかを判定する
  for (let y = 0; y < currentBlock.length; y++) {
    for (let x = 0; x < currentBlock[y].length; x++) {
      // テトリスの現在のブロックの指定した位置にブロックが存在しない場合は、次の位置を処理する
      if (currentBlock[y][x] === 0) {
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
      if (currentBlock[y][x] === 0) {
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
function rotate() {
  // テトリスの現在のブロックの回転角度を更新する
  currentRotation++;
  if (currentRotation >= currentBlock.length) {
    currentRotation = 0;
  }
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
      if (currentBlock[y][x] === 0) {
        continue;
      }

      // テトリスの現在のブロックがフィールドの範囲外にある場合は、trueを返す
      if (currentY + y >= FIELD_ROWS) {
        return true;
      }

      // テトリスの現在のブロックが他のブロックと重なっている場合は、trueを返す
      if (field[currentY + y][currentX + x] === 1) {
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

  // テトリスのフィールドを描画する
  for (let y = 0; y < FIELD_ROWS; y++) {
    for (let x = 0; x < FIELD_COLS; x++) {
      // テトリスのフィールドの指定した位置にブロックが存在する場合
      if (field[y][x]) {
        // テトリスのブロックを描画する
        ctx.fillStyle = "#333";
        ctx.fillRect(x * 20, y * 20, 20, 20);
      }
    }
  }

  // テトリスの現在のブロックを描画する
  if (currentBlock) {
    for (let y = 0; y < currentBlock.length; y++) {
      for (let x = 0; x < currentBlock[y].length; x++) {
        // テトリスの現在のブロックの指定した位置にブロックが存在する場合
        if (currentBlock[y][x]) {
          // テトリスの現在のブロックを描画する
          ctx.fillStyle = "#333";
          ctx.fillRect((currentX + x) * 20, (currentY + y) * 20, 20, 20);
        }
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
        field[currentY + y][currentX + x] = 1;
      }
    }
  }

  // テトリスのスコアを更新する
  score += 10;

  // テトリスの
}

// テトリスのゲームを開始する
function start() {
  // テトリスのフィールドを初期化する
  initField();

  // テトリスの新しいブロックを生成する
  createBlock();

  // テトリスのゲームを更新する
  update();
}

// テトリスのゲームを停止する
function stop() {
  // テトリスのゲームを停止する
  cancelAnimationFrame(animationFrameId);
}

// テトリスのゲームを更新する
function update() {
  // テトリスのフィールドを描画する
  renderField();

  // テトリスのブロックを落下させる
  dropBlock();

  // テトリスのブロックが着地している場合
  if (isBlockLocked()) {
    // テトリスの現在のブロックをフィールドに設定する
    lockBlock();

    // テトリスのフィールドを消去する
    clearLines();

    // テトリスの新しいブロックを生成する
    createBlock();

    // テトリスのゲームが終了している場合は、処理を終了する
    if (isGameOver) {
      return;
    }
  }

  // テトリスのゲームを再描画する
  animationFrameId = requestAnimationFrame(update);
}

// テトリスのフィールドを消去する
function clearLines() {
  // テトリスのフィールドから消去する行の数
  let clearLines = 0;

  // テトリスのフィールドを消去する
  for (let y = 0; y < FIELD_ROWS; y++) {
  // テトリスのフィールドの指定した行が埋まっている場合
    if (field[y].every(block => block === 1)) {
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
  score += clearLines * 100;
  }

  // テトリスのレベルを更新する
  level = Math.floor(score / 1000) + 1;
}

// テトリスのゲームを開始する
start();

// テトリスのキーイベントを処理する
document.addEventListener("keydown", event => {
  // テトリスのゲームが終了している場合は、処理を終了する
  if (isGameOver) {
    return;
  }

  // テトリスのキーイベントを処理する
  switch (event.keyCode) {
  // テトリスのブロックを右に移動する場合
  case 39:
    moveRight();
    break;

  // テトリスのブロックを左に移動する場合
  case 37:
    moveLeft();
    break;

  // テトリスのブロックを回転させる場合
  case 38:
  rotate();
  break;

  // テトリスのゲームを停止する場合
  case 27:
    stop();
    break;

  // テトリスのゲームを再開する場合
  case 13:
    start();
    break;
  }
});