const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const msgDiv = document.getElementById('msg');

const TILE_SIZE = 32;
const MAP_W = 15;
const MAP_H = 10;

// 맵, 플레이어, 몬스터, 아이템
let map, player, monsters, items, running, gameOver;

function resetGame() {
  map = Array.from({length: MAP_H}, () => Array(MAP_W).fill(0));
  player = { x: 2, y: 2, hp: 10, maxHp: 10, atk: 2, exp: 0, lv: 1, items: [] };
  monsters = [
    { x: 8, y: 4, hp: 5, maxHp: 5, atk: 1, name: '도깨비' },
    { x: 12, y: 7, hp: 8, maxHp: 8, atk: 2, name: '구미호' }
  ];
  items = [
    { x: 5, y: 3, type: 'potion', name: '체력포션', effect: () => { player.hp = Math.min(player.maxHp, player.hp + 5); } },
    { x: 10, y: 8, type: 'sword', name: '동검', effect: () => { player.atk += 2; } }
  ];
  running = true;
  gameOver = false;
  msgDiv.textContent = '';
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // 맵 배경
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      ctx.fillStyle = '#444';
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#222';
      ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
  // 아이템
  for (const item of items) {
    ctx.fillStyle = item.type === 'potion' ? '#0f0' : '#fa0';
    ctx.beginPath();
    ctx.arc(item.x * TILE_SIZE + 16, item.y * TILE_SIZE + 16, 10, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.fillText(item.name, item.x * TILE_SIZE + 2, item.y * TILE_SIZE + 28);
  }
  // 몬스터
  for (const m of monsters) {
    ctx.fillStyle = '#f44';
    ctx.fillRect(m.x * TILE_SIZE + 4, m.y * TILE_SIZE + 4, 24, 24);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(m.name, m.x * TILE_SIZE + 2, m.y * TILE_SIZE + 28);
    // HP bar
    ctx.fillStyle = '#0f0';
    ctx.fillRect(m.x * TILE_SIZE + 4, m.y * TILE_SIZE, 24 * (m.hp / m.maxHp), 4);
  }
  // 플레이어
  ctx.fillStyle = '#4af';
  ctx.beginPath();
  ctx.arc(player.x * TILE_SIZE + 16, player.y * TILE_SIZE + 16, 12, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '14px sans-serif';
  ctx.fillText('나', player.x * TILE_SIZE + 6, player.y * TILE_SIZE + 22);
  // UI
  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.fillText(`HP: ${player.hp}/${player.maxHp}  LV: ${player.lv}  EXP: ${player.exp}  ATK: ${player.atk}`, 10, 20);
  ctx.fillText(`아이템: ${player.items.map(i=>i.name).join(', ')}`, 10, 40);
}

function tryMove(dx, dy) {
  if (!running) return;
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return;
  // 몬스터 충돌?
  const mIdx = monsters.findIndex(m => m.x === nx && m.y === ny);
  if (mIdx !== -1) {
    attackMonster(monsters[mIdx]);
    return;
  }
  // 아이템 획득?
  const iIdx = items.findIndex(i => i.x === nx && i.y === ny);
  if (iIdx !== -1) {
    const item = items[iIdx];
    item.effect();
    player.items.push(item);
    msgDiv.textContent = `${item.name}을(를) 획득!`;
    items.splice(iIdx, 1);
  }
  player.x = nx;
  player.y = ny;
  monstersAct();
  draw();
}

function attackMonster(monster) {
  monster.hp -= player.atk;
  msgDiv.textContent = `${monster.name}에게 ${player.atk} 데미지!`;
  if (monster.hp <= 0) {
    msgDiv.textContent = `${monster.name} 처치! 경험치 +3`;
    player.exp += 3;
    monsters = monsters.filter(m => m !== monster);
    if (player.exp >= 5 * player.lv) {
      player.lv++;
      player.maxHp += 3;
      player.hp = player.maxHp;
      player.atk++;
      player.exp = 0;
      msgDiv.textContent += ` 레벨업!`;
    }
  } else {
    player.hp -= monster.atk;
    msgDiv.textContent += ` 반격받아 HP -${monster.atk}`;
    if (player.hp <= 0) {
      running = false;
      gameOver = true;
      msgDiv.textContent = '게임 오버!';
    }
  }
  monstersAct();
  draw();
}

function monstersAct() {
  // 몬스터가 한 칸씩 플레이어에게 다가옴
  for (const m of monsters) {
    let dx = player.x - m.x;
    let dy = player.y - m.y;
    if (Math.abs(dx) > Math.abs(dy)) m.x += Math.sign(dx);
    else if (dy !== 0) m.y += Math.sign(dy);
  }
}

window.addEventListener('keydown', e => {
  if (!running) return;
  if (e.key === 'ArrowLeft') tryMove(-1, 0);
  if (e.key === 'ArrowRight') tryMove(1, 0);
  if (e.key === 'ArrowUp') tryMove(0, -1);
  if (e.key === 'ArrowDown') tryMove(0, 1);
});

startBtn.onclick = () => {
  resetGame();
};

draw();
