// ===== ドット絵（ピコーン・クエスト本体から流用） =====
/* ---------- pixel sprites ---------- */
const BASEPAL = {k:'#1b1626', w:'#f6f4ee', e:'#1b1626', m:'#c8324a', s:'#f2c494', Y:'#f2c23e'};
const SPR = {
  hero:{pal:{H:'#8a4a22',B:'#2f64cc',P:'#5a3a22',g:'#f2c23e',w:'#dfe8f2'},rows:[
    "....kkkk....",
    "...kHHHHk...",
    "..kHHHHHHk..",
    "..kHHssssk..",
    "...ksesek...",
    "...kssssk...",
    "..kBBBBBBk.w",
    ".kBBBBBBBBkw",
    ".ksBBBBBBskw",
    "..kBYYYYBk.g",
    "...kBkkBk...",
    "...kPk.kPk..",
    "..kkk..kkk.."]},
  slime:{pal:{B:'#3a8ee8'},rows:[
    ".....kk.....",
    "....kBBk....",
    "...kBBBBk...",
    "..kBwBBBBk..",
    ".kBBBBBBBBk.",
    ".kBBeBBeBBk.",
    "kBBBBBBBBBBk",
    "kBBBmmmmBBBk",
    ".kkkkkkkkkk."]},
  bat:{pal:{B:'#7a4ab0'},rows:[
    "k..........k",
    "kk...kk...kk",
    "kBk.kBBk.kBk",
    "kBBkBeeBkBBk",
    "kBBBBBBBBBBk",
    ".kBBBwwBBBk.",
    "..kk.BB.kk..",
    ".....kk....."]},
  goblin:{pal:{G:'#5aa040',C:'#8a5a30',W:'#b07a44'},rows:[
    "........kk..",
    "....kkkkWWk.",
    "...kGGGGkWk.",
    "..kGeGGeGkk.",
    "..kGGGGGGk..",
    "...kGmmGk...",
    "..kCCCCCCk..",
    ".kGCCCCCCGk.",
    "..kCCCCCCk..",
    "...kCk.kCk..",
    "...kGk.kGk..",
    "..kkk..kkk.."]},
  skel:{pal:{W:'#e8e4d0',S:'#b8c8d8'},rows:[
    "....kkkk....",
    "...kWWWWk...",
    "..kWkWWkWk..",
    "..kWWWWWWk..",
    "...kWkkWk..S",
    "....kWWk..S.",
    "..kWWWWWWkS.",
    "..kWkWWkWk..",
    "...kWWWWk...",
    "...kWkkWk...",
    "...kWk.kWk..",
    "..kkk..kkk.."]},
  mush:{pal:{R:'#d84040',S:'#f0e0c0'},rows:[
    "...kkkkkk...",
    "..kRRwRRRk..",
    ".kRwRRRRwRk.",
    "kRRRRRwRRRRk",
    "kkkkkkkkkkkk",
    "...kSSSSk...",
    "...kSeSek...",
    "...kSSSSk...",
    "...kSSSSk...",
    "....kkkk...."]},
  wolf:{pal:{G:'#8890a0',W:'#d0d4dc'},rows:[
    ".........k.k",
    "........kGGk",
    "........kGeG",
    ".kkkkkkkkGGG",
    "kGGGGGGGGGkk",
    "kGGGGGGGGGk.",
    ".kGGWWWWGGk.",
    ".kGk.kGk.kGk",
    ".kk..kk..kk."]},
  golem:{pal:{G:'#9a8a70',L:'#5a9a40'},rows:[
    "...kkkkkk...",
    "..kGGGGGGk..",
    "..kGeGGeGk..",
    ".kkGGGGGGkk.",
    "kGGGGGGGGGGk",
    "kGkGGGGGGkGk",
    "kGkGGLGGGkGk",
    "kGkGGGGGGkGk",
    ".k.kGGGGk.k.",
    "...kGkkGk...",
    "..kGGk.kGGk.",
    "..kkkk.kkkk."]},
  dragon:{pal:{R:'#d03a2a',Y:'#f0c060'},rows:[
    "..........kkk...",
    ".........kRRRk..",
    "........kReRRRk.",
    "........kRRRRRk.",
    "...kk...kRRkkk..",
    "..kRRk.kRRk.....",
    ".kRRRRkRRRk.....",
    "kRRYYRRRRRRk....",
    "kRRYYYRRRRRRk...",
    ".kRRYYRRRRRRkk..",
    "..kRRRRRRRRRRRk.",
    "...kRRkkkRRkkRRk",
    "...kRk...kRk.kk.",
    "...kkk...kkk...."]},
  bulb:{pal:{Y:'#ffe14a',G:'#a8a8b0'},rows:[
    "..kkk..",
    ".kYYYk.",
    "kYYwYYk",
    "kYYYYYk",
    ".kYYYk.",
    "..kGk..",
    "..kGk..",
    "...k..."]},
};
const sprCache = {};
function getSpr(key, white){
  const ck = key + (white ? '#w' : '');
  if (sprCache[ck]) return sprCache[ck];
  const d = SPR[key], rows = d.rows;
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++){
    const ch = r[i]; if (ch === '.' || ch === ' ') continue;
    const col = white ? '#ffffff' : (d.pal[ch] || BASEPAL[ch]); if (!col) continue;
    x.fillStyle = col; x.fillRect(i, j, 1, 1);
  }});
  return sprCache[ck] = c;
}