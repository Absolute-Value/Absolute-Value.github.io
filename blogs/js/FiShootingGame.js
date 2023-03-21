let DEFAULT_FONT = "MS Gothic";
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

// エイリアンを生成する関数
function createAlien() {
	radius = 6 + Math.random() * 6;
	if (radius > 8){
		var color = "green";
	} else {
		var color = "red";
	}
	var alien = {
		x: Math.random() * canvas.width,
		y: -8,
		radius: radius,
		speed: 0.5 + score / 100,
		color: color
	};
	aliens.push(alien);
}

// キーボード入力の処理
var keys = {};
document.addEventListener("keydown", function(event) {
	keys[event.code] = true;
	switch (event.code) {
		case "KeyX":
			switch (mode) {
				case 0:
					mode = 1
					break
				case 1:
					createBullet();
					break
			}
			break
		case "Enter":
			if (mode = 2) {
				mode = 0
			}
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
			mode = 2;
			count = 200;
			player.x = canvas.width / 2;
			aliens = [];
			bullets = [];
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

// ゲーム画面描画
function drawGame() {
	// 背景を描画
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// プレイヤーを描画
	ctx.fillStyle = "white";
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
	ctx.fill();

	// エイリアンを描画
	for (var i = 0; i < aliens.length; i++) {
		ctx.fillStyle = aliens[i].color;
		ctx.beginPath();
		ctx.arc(aliens[i].x, aliens[i].y, aliens[i].radius, 0, Math.PI * 2);
		ctx.fill();
	}

    // 弾を描画する
    ctx.fillStyle = "white";
    for (var i = 0; i < bullets.length; i++) {
		ctx.beginPath();
		ctx.arc(bullets[i].x, bullets[i].y, bullets[i].radius, 0, Math.PI * 2);
		ctx.fill();
    }

	// スコアを描画する
	ctx.fillStyle = "white";
	ctx.font = "10px " + DEFAULT_FONT;
	ctx.fillText("Score: " + score, 0, canvas.height-1);

	// 当たり判定
	collisionDetection();
}

// ゲーム開始画面描画
function drawStart() {
	// 背景を描画
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// タイトルを描画する
	ctx.fillStyle = "white";
	ctx.font = "20px " + DEFAULT_FONT;
	ctx.fillText("Shooting Game", canvas.width/2-75, canvas.height/2-5);
	ctx.font = "10px " + DEFAULT_FONT;
	ctx.fillText("Press x key", canvas.width/2-30, canvas.height/2+10);
}

function drawGameOver() {
	// 背景を描画
	ctx.fillStyle = "#000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// タイトルを描画する
	ctx.fillStyle = "white";
	ctx.font = "20px " + DEFAULT_FONT;
	ctx.fillText("GameOver", canvas.width/2-50, canvas.height/2-5);
	ctx.font = "10px " + DEFAULT_FONT;
	ctx.fillText("Score: " + score, canvas.width/2-20, canvas.height/2+10);
	ctx.fillText("Press Enter key", canvas.width/2-45, canvas.height/2+20);
}

// ゲームループ
var mode=0
var count = 200;
var score = 0;
var gameLoop = setInterval(function() {
	switch(mode) {
		case 0:
			drawStart();
			break
		case 1:
			movePlayer();
			moveAlien();
			moveBullet();
			removeBullet();
			drawGame();
			count += 1;
			if (count >= 200) {
				createAlien()
				count = 0
			}
			break
		case 2:
			score = 0;
			drawGameOver();
	}
}, 5);


