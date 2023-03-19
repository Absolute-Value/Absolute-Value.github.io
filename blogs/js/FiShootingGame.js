var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// プレイヤーの初期位置とサイズ
var player = {
	x: canvas.width / 2,
	y: canvas.height - 30,
	radius: 8
};

// エイリアンの初期位置とサイズ
var alien = {
	x: 8,
	y: 30,
	radius: 8,
	speed: 0.5
};

// キーボード入力の処理
var keys = {};
document.addEventListener("keydown", function(event) {
	keys[event.keyCode] = true;
});
document.addEventListener("keyup", function(event) {
	delete keys[event.keyCode];
});

// プレイヤーの移動
function movePlayer() {
	if (keys[37] && player.x > player.radius/2) { // 左矢印キー
		player.x -= 1;
	}
	if (keys[39] && player.x < canvas.width - player.radius/2) { // 右矢印キー
		player.x += 1;
	}
}

// エイリアンの移動
function moveAlien() {
	alien.y += alien.speed;
	if (alien.y > canvas.height + alien.radius) {
		alien.y = -alien.radius;
		alien.x = Math.random() * canvas.width;
	}
}

// 当たり判定
function collisionDetection() {
	var dx = player.x - alien.x;
	var dy = player.y - alien.y;
	var distance = Math.sqrt(dx * dx + dy * dy);
	if (distance < player.radius + alien.radius) {
		alert("ゲームオーバー");
		clearInterval(gameLoop);
	}
}

// 描画
function draw() {
	// 背景を描画
	ctx.fillStyle = "#eee";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// プレイヤーを描画
	ctx.fillStyle = "#f00";
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
	ctx.fill();

	// エイリアンを描画
	ctx.fillStyle = "#0f0";
	ctx.beginPath();
	ctx.arc(alien.x, alien.y, alien.radius, 0, Math.PI * 2);
	ctx.fill();

	// 当たり判定
	collisionDetection();
}

// ゲームループ
var gameLoop = setInterval(function() {
    movePlayer();
    moveAlien();
    draw();
}, 5);


