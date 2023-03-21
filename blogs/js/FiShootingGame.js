var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// プレイヤーの初期位置とサイズ
var player = {
	x: canvas.width / 2,
	y: canvas.height - 30,
	radius: 8
};

// エイリアンのオブジェクトを格納する配列
var aliens = [];

// ゲーム開始時にエイリアンを生成する
createAlien();

// エイリアンを生成する関数
function createAlien() {
	var alien = {
		x: Math.random() * canvas.width,
		y: -8,
		radius: 8,
		speed: 0.5
	};
	aliens.push(alien);
}

// キーボード入力の処理
var keys = {};
document.addEventListener("keydown", function(event) {
	keys[event.code] = true;
	if (event.code === "KeyX") {
		createBullet();
	}
});
document.addEventListener("keyup", function(event) {
	delete keys[event.code];
});

// プレイヤーの移動
function movePlayer() {
	if (keys["ArrowLeft"] && player.x > player.radius/2) { // 左矢印キー
		player.x -= 1;
	}
	if (keys["ArrowRight"] && player.x < canvas.width - player.radius/2) { // 右矢印キー
		player.x += 1;
	}
}

// エイリアンの移動
function moveAlien() {
	for (var i = 0; i < aliens.length; i++) {
		aliens[i].y += aliens[i].speed;
		if (aliens[i].y > canvas.height + aliens[i].radius) {
			aliens[i].y = -aliens[i].radius;
			aliens[i].x = Math.random() * canvas.width;
		}
	}
}

// 当たり判定
function collisionDetection() {
	hitTest();
	for (var i = 0; i < aliens.length; i++) {
		var dx = player.x - aliens[i].x;
		var dy = player.y - aliens[i].y;
		var distance = Math.sqrt(dx * dx + dy * dy);
		if (distance < player.radius + aliens[i].radius) {
			alert("ゲームオーバー");
			clearInterval(gameLoop);
		}
	}
}

// 弾のオブジェクトを作成し、弾の初期位置とサイズを設定する
var bullets = [];

function createBullet() {
	var bullet = {
		x: player.x + player.radius / 2,
		y: player.y,
		radius: 2,
		speed: 4
	};
	bullets.push(bullet);
}

// 弾を移動させる
function moveBullet() {
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].y -= bullets[i].speed;
	}
}

// 弾がエイリアンに当たったかどうかを判定する
function hitTest() {
	for (var i = 0; i < bullets.length; i++) {
		for (var j = 0; j < aliens.length; j++) {
			var dx = bullets[i].x - aliens[j].x;
			var dy = bullets[i].y - aliens[j].y;
			var distance = Math.sqrt(dx * dx + dy * dy);
			if (distance < bullets[i].radius + aliens[j].radius) {
				// 当たった弾とエイリアンを削除する
				bullets.splice(i, 1);
				aliens.splice(j, 1);
				// スコアを加算する
				score++;
				break;
			}
		}
	}
}

// 弾が画面外に出た場合は、弾のオブジェクトを削除する
function removeBullet() {
	for (var i = 0; i < bullets.length; i++) {
		if (bullets[i].y < 0) {
			bullets.splice(i, 1);
			break;
		}
	}
}

// 描画
function draw() {
	// 背景を描画
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// プレイヤーを描画
	ctx.fillStyle = "#f00";
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
	ctx.fill();

	// エイリアンを描画
	ctx.fillStyle = "#0f0";
	for (var i = 0; i < aliens.length; i++) {
		ctx.beginPath();
		ctx.arc(aliens[i].x, aliens[i].y, aliens[i].radius, 0, Math.PI * 2);
		ctx.fill();
	}

    // 弾を描画する
    ctx.fillStyle = "red";
    for (var i = 0; i < bullets.length; i++) {
		ctx.beginPath();
		ctx.arc(bullets[i].x, bullets[i].y, bullets[i].radius, 0, Math.PI * 2);
		ctx.fill();
    }

	// スコアを描画する
	ctx.fillStyle = "white";
	ctx.font = "10px Arial";
	ctx.fillText("Score: " + score, 0, canvas.height-1);

	// 当たり判定
	collisionDetection();
}

// ゲームループ
var count = 0;
var score = 0;
var gameLoop = setInterval(function() {
    movePlayer();
    moveAlien();
    moveBullet();
	removeBullet();
    draw();
	count += 1;
	if (count >= 200) {
		createAlien()
		count = 0
	}
}, 5);


