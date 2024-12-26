let sprites = {
  player1: {
    idle: { img: null, width: 85, height: 118, frames: 7 },
    walk: { img: null, width: 167, height: 132, frames: 13 },
    jump: { img: null, width: 106, height: 112, frames: 6 }
  },
  player2: {
    idle: { img: null, width: 120, height: 134, frames: 6 },
    walk: { img: null, width: 136, height: 96, frames: 4 },
    jump: { img: null, width: 123, height: 94, frames: 4 }
  }
};

let player1, player2;
let bgImage;
let gameOver = false;
let restartButton;
let energyBalls = [];  // 存儲所有氣功

function preload() {
  console.log('開始載入圖片...');
  
  // 載入背景圖片
  bgImage = loadImage('background/background.jpg', 
    () => console.log('背景圖片載入成功'),
    () => console.log('背景圖片載入失敗')
  );
  
  // 載入玩家1圖片
  sprites.player1.idle.img = loadImage('player1/all.1.png',
    () => console.log('Player1 idle loaded'),
    () => console.log('Player1 idle 載入失敗')
  );
  sprites.player1.walk.img = loadImage('player1/all.2.png',
    () => console.log('Player1 walk loaded'),
    () => console.log('Player1 walk 載入失敗')
  );
  sprites.player1.jump.img = loadImage('player1/all.3.png',
    () => console.log('Player1 jump loaded'),
    () => console.log('Player1 jump 載入失敗')
  );
  
  // 載入玩家2圖片
  sprites.player2.idle.img = loadImage('player2/all.1.png',
    () => console.log('Player2 idle loaded'),
    () => console.log('Player2 idle 載入失敗')
  );
  sprites.player2.walk.img = loadImage('player2/all.2.png',
    () => console.log('Player2 walk loaded'),
    () => console.log('Player2 walk 載入失敗')
  );
  sprites.player2.jump.img = loadImage('player2/all.3.png',
    () => console.log('Player2 jump loaded'),
    () => console.log('Player2 jump 載入失敗')  
  );
}

function setup() {
  console.log('設置畫布...');
  createCanvas(windowWidth, windowHeight);
  
  // 初始化玩家1
  player1 = {
    x: 200,
    y: height - 200,
    vx: 0,
    vy: 0,
    state: 'idle',
    frame: 0,
    direction: 1,
    isJumping: false,
    health: 100
  };
  
  // 初始化玩家2
  player2 = {
    x: width - 200,
    y: height - 200,
    vx: 0,
    vy: 0,
    state: 'idle',
    frame: 0,
    direction: -1,
    isJumping: false,
    health: 100
  };
  
  console.log('初始化完成');
  
  // 創建重新開始按鈕（一開始隱藏）
  restartButton = createButton('再玩一局');
  restartButton.position(width/2 - 50, height/2 + 50);
  restartButton.size(100, 40);
  restartButton.mousePressed(restartGame);
  restartButton.hide();
  
  restartButton.style('background-color', '#4CAF50');
  restartButton.style('color', 'white');
  restartButton.style('border', 'none');
  restartButton.style('border-radius', '5px');
  restartButton.style('font-size', '16px');
  restartButton.style('cursor', 'pointer');
  
  // 懸停效果
  restartButton.mouseOver(() => {
    restartButton.style('background-color', '#45a049');
  });
  restartButton.mouseOut(() => {
    restartButton.style('background-color', '#4CAF50');
  });
  
  // 如果你有氣功的圖片，可以在這裡加載
  // energyBallImg = loadImage('path/to/energy-ball.png');
}

function draw() {
  try {
    if (bgImage) {
      image(bgImage, 0, 0, width, height);
    } else {
      background(220);
    }
    
    if (!gameOver) {
      handleInput();
      updatePlayer(player1);
      updatePlayer(player2);
      updateEnergyBalls();  // 更新氣功
      checkCollision();
      
      drawPlayer(player1, sprites.player1);
      drawPlayer(player2, sprites.player2);
      drawEnergyBalls();    // 繪製氣功
      drawHealthBars();
      
      if (player1.health <= 0 || player2.health <= 0) {
        gameOver = true;
        restartButton.show();
      }
    } else {
      drawGameOver();
    }
  } catch (error) {
    console.error('Draw error:', error);
  }
}

function handleInput() {
  // Player 1 控制
  if (keyIsDown(65)) { // A鍵
    player1.vx = -5;
    player1.direction = -1;  // 向左時方向為 -1
    if (!player1.isJumping) player1.state = 'walk';
  } else if (keyIsDown(68)) { // D鍵
    player1.vx = 5;
    player1.direction = 1;   // 向右時方向為 1
    if (!player1.isJumping) player1.state = 'walk';
  } else {
    player1.vx = 0;
    if (!player1.isJumping) player1.state = 'idle';
  }
  
  // Player 2 控制
  if (keyIsDown(LEFT_ARROW)) {
    player2.vx = -5;
    player2.direction = -1;  // 向左時方向為 -1
    if (!player2.isJumping) player2.state = 'walk';
  } else if (keyIsDown(RIGHT_ARROW)) {
    player2.vx = 5;
    player2.direction = 1;   // 向右時方向為 1
    if (!player2.isJumping) player2.state = 'walk';
  } else {
    player2.vx = 0;
    if (!player2.isJumping) player2.state = 'idle';
  }
}

function keyPressed() {
  // Player 1 跳躍
  if (key === 'w' && !player1.isJumping) {
    player1.vy = -15;
    player1.state = 'jump';
    player1.isJumping = true;
  }
  
  // Player 2 跳躍
  if (keyCode === UP_ARROW && !player2.isJumping) {
    player2.vy = -15;
    player2.state = 'jump';
    player2.isJumping = true;
  }
  
  // Player 1 發射氣功 (空白鍵)
  if (key === ' ') {
    energyBalls.push({
      x: player1.x + (player1.direction * 50),  // 從角色前方發射
      y: player1.y,
      direction: player1.direction,
      speed: 10,
      size: 30,
      owner: 1,
      color: color(0, 0, 255)  // 藍色氣功
    });
  }
  
  // Player 2 發射氣功 (數字1鍵)
  if (key === '1') {
    energyBalls.push({
      x: player2.x + (player2.direction * 50),  // 從角色前方發射
      y: player2.y,
      direction: player2.direction,
      speed: 10,
      size: 30,
      owner: 2,
      color: color(255, 0, 0)  // 紅色氣功
    });
  }
}

function updatePlayer(player) {
  // 重力
  player.vy += 0.8;
  player.y += player.vy;
  
  // 地板碰撞
  if (player.y > height - 200) {
    player.y = height - 200;
    player.vy = 0;
    player.isJumping = false;
  }
  
  // 水平移動
  player.x += player.vx;
  player.x = constrain(player.x, 0, width);
  
  // 降低動畫速度 (從 0.2 改為 0.1)
  player.frame = (player.frame + 0.1) % sprites[player === player1 ? 'player1' : 'player2'][player.state].frames;
}

function drawPlayer(player, spriteData) {
  push();
  translate(player.x, player.y);
  
  // 繪製角色標籤
  fill(0);
  textSize(20);
  textAlign(CENTER);
  text(player === player1 ? "角色1" : "角色2", 0, -spriteData[player.state].height/2 - 20);
  
  // 繪製角色
  scale(player.direction, 1);
  let currentSprite = spriteData[player.state];
  let frameX = floor(player.frame) * currentSprite.width;
  
  image(currentSprite.img,
    -currentSprite.width/2, -currentSprite.height/2,
    currentSprite.width, currentSprite.height,
    frameX, 0,
    currentSprite.width, currentSprite.height);
  pop();
}

// 當視窗大小改變時調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function checkCollision() {
  // 簡單的碰撞��測
  if (player1.x + sprites.player1.idle.width/2 > player2.x - sprites.player2.idle.width/2 &&
      player1.x - sprites.player1.idle.width/2 < player2.x + sprites.player2.idle.width/2 &&
      player1.y + sprites.player1.idle.height/2 > player2.y - sprites.player2.idle.height/2 &&
      player1.y - sprites.player1.idle.height/2 < player2.y + sprites.player2.idle.height/2) {
    player1.health -= 15;  // 碰撞時扣 15 血
    player2.health -= 15;  // 碰撞時扣 15 血
  }
}

function drawHealthBars() {
  // 繪製血量條
  fill(255, 0, 0);
  rect(10, 10, 100, 20);
  fill(0, 255, 0);
  rect(10, 10, player1.health, 20);
  
  fill(255, 0, 0);
  rect(width - 210, 10, 100, 20);
  fill(0, 255, 0);
  rect(width - 210, 10, player2.health, 20);
}

// 新增遊戲結束畫面
function drawGameOver() {
  // 半透明背景
  fill(0, 0, 0, 127);
  rect(0, 0, width, height);
  
  // 顯示獲勝者
  fill(255);
  textSize(64);
  textAlign(CENTER, CENTER);
  let winner = player1.health <= 0 ? "角色2" : "角色1";
  text(winner + " 獲勝！", width/2, height/2 - 50);
}

// 新增重新開始遊戲函數
function restartGame() {
  // 重置玩家狀態
  player1.health = 100;
  player2.health = 100;
  
  // 重置位置
  player1.x = 200;
  player1.y = height - 200;
  player2.x = width - 200;
  player2.y = height - 200;
  
  // 重置其他狀態
  player1.state = 'idle';
  player2.state = 'idle';
  player1.frame = 0;
  player2.frame = 0;
  player1.vx = 0;
  player2.vx = 0;
  player1.vy = 0;
  player2.vy = 0;
  player1.isJumping = false;  // 確保跳躍狀態也被重置
  player2.isJumping = false;
  
  // 隱藏重新開始按鈕
  restartButton.hide();
  
  // 重置遊戲狀態
  gameOver = false;
}

// 更新氣功位置和碰撞檢測
function updateEnergyBalls() {
  for (let i = energyBalls.length - 1; i >= 0; i--) {
    let ball = energyBalls[i];
    ball.x += ball.speed * ball.direction;
    
    // 檢查氣功是否擊中對手
    if (ball.owner === 1) {  // Player 1 的氣功檢查是否擊中 Player 2
      if (checkEnergyBallHit(ball, player2)) {
        player2.health = max(0, player2.health - 10);  // 扣血
        energyBalls.splice(i, 1);  // 移除氣功
        continue;
      }
    } else {  // Player 2 的氣功檢查是否擊中 Player 1
      if (checkEnergyBallHit(ball, player1)) {
        player1.health = max(0, player1.health - 10);  // 扣血
        energyBalls.splice(i, 1);  // 移除氣功
        continue;
      }
    }
    
    // 移除超出畫面的氣功
    if (ball.x < 0 || ball.x > width) {
      energyBalls.splice(i, 1);
    }
  }
}

// 檢查氣功是否擊中玩家
function checkEnergyBallHit(ball, player) {
  let playerWidth = sprites[player === player1 ? 'player1' : 'player2'][player.state].width;
  let playerHeight = sprites[player === player1 ? 'player1' : 'player2'][player.state].height;
  
  return (
    ball.x + ball.size/2 > player.x - playerWidth/4 &&
    ball.x - ball.size/2 < player.x + playerWidth/4 &&
    ball.y + ball.size/2 > player.y - playerHeight/4 &&
    ball.y - ball.size/2 < player.y + playerHeight/4
  );
}

// 繪製氣功
function drawEnergyBalls() {
  for (let ball of energyBalls) {
    push();
    fill(ball.color);
    noStroke();
    ellipse(ball.x, ball.y, ball.size);
    pop();
  }
}
  
