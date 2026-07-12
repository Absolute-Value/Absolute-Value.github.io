(()=>{
"use strict";
const cv=document.getElementById('cv'),cx=cv.getContext('2d');
const W=800,H=600;
const $=id=>document.getElementById(id);
const msgEl=$('msg');

// ---------- Audio ----------
let AC=null;
function ac(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC;}
function beep(f,dur,type='square',vol=.15,slide=0){
  try{const a=ac(),o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,a.currentTime);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),a.currentTime+dur);
  g.gain.setValueAtTime(vol,a.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);
  o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+dur);}catch(e){}
}
function crack(strong){beep(180,.08,'square',strong?.34:.24,-120);beep(900,.05,'triangle',.2,-500);}
function crowd(){try{const a=ac(),len=a.sampleRate*1.4,buf=a.createBuffer(1,len,a.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len)*.5;
  const s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();
  f.type='bandpass';f.frequency.value=900;f.Q.value=.6;g.gain.value=.35;
  s.buffer=buf;s.connect(f).connect(g).connect(a.destination);s.start();}catch(e){}}

// ============================================================
//  透視投影: フィールド座標 (fx: -1..1 左右, fd: 0..1 手前→フェンス, z: 高さ)
// ============================================================
const HORIZON=210, PLATE_Y=545;
// ---------- カメラ: 打撃時=望遠(狭画角) / 打球後=広角 ----------
const CAM_BAT ={spread:5200,size:1.5}; // P・二遊間・センターのみ見える
const CAM_WIDE={spread:1900,size:1.1}; // フィールド全景(画面幅いっぱい)
const cam={k:0,target:0};
function camNow(){
  const e=cam.k<.5?2*cam.k*cam.k:1-Math.pow(-2*cam.k+2,2)/2;
  return{
    spread:CAM_BAT.spread+(CAM_WIDE.spread-CAM_BAT.spread)*e,
    size:  CAM_BAT.size  +(CAM_WIDE.size  -CAM_BAT.size)*e,
  };
}
// 本物の透視投影: 距離に反比例(直線は直線のまま映る)
const DEPTH_K=4;
function proj(fx,fd){
  const c=camNow();
  const t=Math.min(1.15,Math.max(0,fd));
  const z=1+DEPTH_K*t;
  const y=HORIZON+(PLATE_Y-HORIZON)/z;
  const scale=Math.max(.15,1/z);
  const x=400+fx*c.spread*scale;
  return{x,y,scale};
}
const WALL_Z=13;          // フェンスの高さ(z単位)
const MOUND={fx:0,fd:0.34};
// ストライクゾーン(画面固定・プレート上空)
const ZONE={x:400,y:388,w:150,h:172};

// ---------- Fielders (フィールド座標) ----------
function makeFielders(){
  return [
    {name:'投',fx:0,fd:0.34},
    {name:'一',fx:0.22,fd:0.34},
    {name:'二',fx:0.12,fd:0.46},
    {name:'遊',fx:-0.12,fd:0.46},
    {name:'三',fx:-0.22,fd:0.34},
    {name:'左',fx:-0.46,fd:0.78},
    {name:'中',fx:0,fd:0.84},
    {name:'右',fx:0.46,fd:0.78},
  ].map(f=>({...f,hx:f.fx,hd:f.fd,chasing:false,hasBall:false}));
}
// ファウル判定: フェアゾーンは |fx| <= fd*1.05 + 0.06
function isFair(fx,fd){return Math.abs(fx)<=fd*1.05+0.06;}

// ---------- State ----------
const G={
  state:'title',t:0,
  score:0,hr:0,hits:0,balls:0,strikes:0,outs:0,
  bases:[false,false,false],
  viz:[], // 走者アニメ {v:塁パス位置0..4, targetV, run}
  scorePops:[], // 得点演出 {from,to,t}
  pitch:null,fly:null,
  swing:-1,swung:false,
  cursor:{x:ZONE.x,y:ZONE.y,r:30},
  fielders:makeFielders(),
  particles:[],fireworks:[],
  shake:0,resultDelay:0,speedMul:1,pitchType:'straight',
};
const WINDUP_LEN=105;
const PITCHES={
  straight:{name:'ストレート',spd:1.0,curve:0,drop:0},
  curve:{name:'カーブ',spd:.82,curve:1,drop:.4},
  fork:{name:'フォーク',spd:.9,curve:0,drop:1},
  change:{name:'チェンジアップ',spd:.68,curve:.3,drop:.2},
};

// ---------- Input ----------
function canvasPos(e){const r=cv.getBoundingClientRect();
  return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
cv.addEventListener('pointermove',e=>{const p=canvasPos(e);moveCursor(p.x,p.y);});
cv.addEventListener('pointerdown',e=>{const p=canvasPos(e);moveCursor(p.x,p.y);swingInput();});
window.addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();swingInput();}
  const st=9;
  if(e.code==='ArrowLeft')moveCursor(G.cursor.x-st,G.cursor.y);
  if(e.code==='ArrowRight')moveCursor(G.cursor.x+st,G.cursor.y);
  if(e.code==='ArrowUp')moveCursor(G.cursor.x,G.cursor.y-st);
  if(e.code==='ArrowDown')moveCursor(G.cursor.x,G.cursor.y+st);
});
function moveCursor(x,y){
  const m=40;
  G.cursor.x=Math.max(ZONE.x-ZONE.w/2-m,Math.min(ZONE.x+ZONE.w/2+m,x));
  G.cursor.y=Math.max(ZONE.y-ZONE.h/2-m,Math.min(ZONE.y+ZONE.h/2+m,y));
}
function swingInput(){
  if(G.state==='title'||G.state==='over')return;
  if((G.state==='pitch'||G.state==='windup')&&!G.swung){
    G.swung=true;G.swing=0;beep(300,.06,'sawtooth',.12,-100);
    if(G.state==='pitch')judgeSwing();
  }
}
$('btnStart').onclick=()=>{$('start').style.display='none';ac();startGame();};
$('btnRetry').onclick=()=>{$('over').style.display='none';startGame();};

function startGame(){
  Object.assign(G,{score:0,hr:0,hits:0,balls:0,strikes:0,outs:0,speedMul:1,
    bases:[false,false,false],viz:[],scorePops:[],particles:[],fireworks:[],fielders:makeFielders()});
  updateHUD();toWindup();
}
function updateHUD(){
  $('hScore').textContent=G.score;$('hHR').textContent=G.hr;$('hHits').textContent=G.hits;
  [...$('hBalls').children].forEach((el,i)=>el.classList.toggle('on',i<G.balls));
  [...$('hStrikes').children].forEach((el,i)=>el.classList.toggle('on',i<G.strikes));
  [...$('hOuts').children].forEach((el,i)=>el.classList.toggle('on',i<G.outs));
  ['b1','b2','b3'].forEach((c,i)=>document.querySelector('#bases .'+c).classList.toggle('on',G.bases[i]));
}
function showMsg(text,cls){
  msgEl.textContent=text;msgEl.classList.remove('show','hr','out');void msgEl.offsetWidth;
  if(cls)msgEl.classList.add(cls);msgEl.classList.add('show');
}

// ---------- Pitch ----------
function toWindup(){
  G.state='windup';G.t=0;G.swung=false;G.swing=-1;G.pitch=null;G.fly=null;
  G.batterGone=false; // 次の打者が打席に入る
  cam.target=0; // 打撃ビューに戻す
  G.fielders=makeFielders();
  const keys=Object.keys(PITCHES);
  G.pitchType=keys[Math.random()*keys.length|0];
  const inZone=Math.random()<.7;
  let tx,ty;
  if(inZone){
    tx=ZONE.x+(Math.random()*2-1)*(ZONE.w/2-18);
    ty=ZONE.y+(Math.random()*2-1)*(ZONE.h/2-18);
  }else{
    const side=Math.random()*4|0,off=24+Math.random()*30;
    tx=ZONE.x+(Math.random()*2-1)*ZONE.w*.55;
    ty=ZONE.y+(Math.random()*2-1)*ZONE.h*.55;
    if(side===0)tx=ZONE.x-ZONE.w/2-off;if(side===1)tx=ZONE.x+ZONE.w/2+off;
    if(side===2)ty=ZONE.y-ZONE.h/2-off;if(side===3)ty=ZONE.y+ZONE.h/2+off;
  }
  G.nextTarget={tx,ty,inZone};
}
function toPitch(){
  G.state='pitch';G.t=0;
  const def=PITCHES[G.pitchType];
  G.pitch={p:0,speed:.0148*def.spd*G.speedMul*(0.92+Math.random()*.18),
    tx:G.nextTarget.tx,ty:G.nextTarget.ty,inZone:G.nextTarget.inZone,def};
  beep(700,.05,'sine',.08);
}
// 投球: 奥(投手の手元)から手前のゾーンへ、加速しながら大きくなる
function pitchPos(p){
  const t=p,pt=G.pitch,def=pt.def;
  const rel=proj(MOUND.fx,MOUND.fd);
  const rx=rel.x+6, ry=rel.y-58*rel.scale*camNow().size-14; // リリースポイント
  const e=t*t*.55+t*.45; // 手前ほど速く見える
  let x=rx+(pt.tx-rx)*e;
  let y=ry+(pt.ty-ry)*e;
  if(def.curve)x+=Math.sin(t*Math.PI)*40*def.curve*t;
  if(def.drop)y-=Math.sin(t*Math.PI)*36*def.drop*(1-t*.35);
  const r=2.5+Math.pow(t,1.6)*12.5;
  return{x,y,r};
}

// ---------- Swing → launch ----------
function judgeSwing(){
  const p=G.pitch.p;
  const GOOD=[.78,1.04],PERF=[.875,.99];
  if(p<GOOD[0]||p>GOOD[1])return;
  const dx=G.cursor.x-G.pitch.tx,dy=G.cursor.y-G.pitch.ty;
  const dist=Math.hypot(dx,dy);
  const MEET=G.cursor.r+11;
  if(dist>MEET)return;
  const tq=(p>=PERF[0]&&p<=PERF[1])?1:0.6;
  const cq=1-dist/MEET;
  const q=tq*(0.3+cq*0.7);
  launchBall(q,dx,dy,p);
}
function launchBall(q,dx,dy,p){
  crack(q>.6);G.shake=6+q*10;
  const loft=Math.max(-1,Math.min(1,dy/26)); // +:すくい上げ -:叩き(感度ゆるめ)
  // 飛距離: ポップフライ(loft大)は失速、ライナー〜中弾道が最も伸びる
  const carry=loft>0?(1-loft*0.6):(1-Math.abs(loft)*0.15);
  const vd=(0.007+q*0.011)*carry;                    // 奥への速度
  const vz=Math.max(.25,(1.7+loft*1.5)*(0.5+q*.55)); // 打ち上げ(範囲を圧縮)
  // 打球方向はタイミングで決まる(右打者):
  //   早い(p小) → 引っ張り=レフト(fx負) / 遅い(p大) → 流し=ライト(fx正) / ジャスト → センター
  const T_CENTER=0.9325; // パーフェクトゾーンの中心
  const spray=(p-T_CENTER)*0.085;
  const vfx=spray+dx*0.0004+(Math.random()*0.0024-0.0012); // カーソル左右は微調整程度
  G.fly={
    fx:0,fd:0.02,z:2.5,
    vfx,vd,vz,g:.055,
    phase:'fly',trail:[],frames:0,q,
    wallHit:false,judged:false,outcome:null,
  };
  G.state='hitfly';G.t=0;G.pitch=null;
  cam.target=1; // 打った瞬間 → 広角へズームアウト
  assignChaser();
  const pos=proj(0,0.02);
  const n=q>.8?28:12;
  for(let i=0;i<n;i++)G.particles.push({x:pos.x,y:pos.y-30,
    vx:(Math.random()*2-1)*6,vy:(Math.random()*2-1)*6,
    life:30+Math.random()*20,c:q>.8?'#f2b632':'#fff',s:2+Math.random()*3});
}
function predictLanding(){
  const f=G.fly;
  let fx=f.fx,fd=f.fd,z=f.z,vfx=f.vfx,vd=f.vd,vz=f.vz;
  for(let i=0;i<700;i++){
    fx+=vfx;fd+=vd;z+=vz;vz-=f.g;vd*=.998;
    if(fd>=1)return{fx,fd:1,z,overFence:z>=WALL_Z};
    if(z<=0)return{fx,fd,z:0,overFence:false};
  }
  return{fx,fd,z:0,overFence:false};
}
function assignChaser(){
  const land=predictLanding();
  G.fly.pred=land;
  if(land.overFence)return;
  let best=null,bd=1e9;
  for(const fd of G.fielders){
    const d=Math.hypot((fd.fx-land.fx)*1.15,fd.fd-land.fd);
    if(d<bd){bd=d;best=fd;}
  }
  if(best){best.chasing=true;}
}

// ---------- 打球&守備シミュレーション ----------
const FIELDER_SPEED=0.0038, CATCH_R=0.026, CATCH_Z=5, REACTION=22; // 反応遅れ(フレーム)
const TRACK_D=0.92; // これより深い飛球は捕球不可(フェンス際で失速)
function stepHitBall(){
  const f=G.fly;f.frames++;
  if(f.phase==='fly'){
    f.fx+=f.vfx;f.fd+=f.vd;f.z+=f.vz;f.vz-=f.g;f.vd*=.998;
    if(f.fd>=1&&!f.wallHit){
      if(f.z>=WALL_Z){settle('hr');return;}
      f.wallHit=true;f.fd=0.995;
      f.vd=-Math.abs(f.vd)*.3;f.vfx*=.5;f.vz=Math.min(f.vz,.3);
      beep(140,.1,'square',.2,-60);
    }
    if(f.z<=0){
      f.z=0;
      if(!isFair(f.fx,f.fd)){settle('foul');return;}
      f.phase='roll';
      f.vd*=.72;f.vfx*=.72;f.vz=0; // 着地後もよく転がる
      reassignToBall();
    }
  }else if(f.phase==='roll'){
    f.fx+=f.vfx;f.fd+=f.vd;
    f.vfx*=.982;f.vd*=.982;
    if(f.fd>=0.99){f.fd=0.99;f.vd=-Math.abs(f.vd)*.3;}
    if(Math.abs(f.vfx)<.0002&&Math.abs(f.vd)<.0002){f.vfx=0;f.vd=0;}
  }
  const sp=proj(f.fx,f.fd);
  f.trail.push({x:sp.x,y:sp.y-f.z*7*sp.scale*camNow().size,s:sp.scale});
  if(f.trail.length>14)f.trail.shift();

  // 野手AI(反応遅れあり)
  for(const fd of G.fielders){
    let tx=fd.hx,td=fd.hd;
    if(fd.chasing&&f.frames>REACTION){
      tx=f.phase==='fly'?f.pred.fx:f.fx;
      td=f.phase==='fly'?f.pred.fd:f.fd;
    }
    const dx=tx-fd.fx,dd=td-fd.fd,d=Math.hypot(dx,dd);
    if(d>0.004){const s=Math.min(FIELDER_SPEED,d);fd.fx+=dx/d*s;fd.fd+=dd/d*s;}
    if(fd.chasing&&!f.judged){
      const bd=Math.hypot((fd.fx-f.fx)*1.15,fd.fd-f.fd);
      if(f.phase==='fly'&&bd<CATCH_R&&f.z<CATCH_Z&&f.z>0&&f.vz<0&&f.fd<TRACK_D){
        fd.hasBall=true;
        settle(isFair(f.fx,f.fd)?'flyout':'foulflyout');return;
      }
      if(f.phase==='roll'&&bd<CATCH_R+0.012){
        fd.hasBall=true;settleGroundPickup(fd);return;
      }
    }
  }
  if(f.frames>560)settleGroundPickup(null);
}
function reassignToBall(){
  for(const fd of G.fielders)fd.chasing=false;
  let best=null,bd=1e9;
  for(const fd of G.fielders){
    const d=Math.hypot((fd.fx-G.fly.fx)*1.15,fd.fd-G.fly.fd);
    if(d<bd){bd=d;best=fd;}
  }
  if(best)best.chasing=true;
}
function settleGroundPickup(fdr){
  const f=G.fly;f.judged=true;
  const pd=fdr?fdr.fd:f.fd, px=fdr?fdr.fx:f.fx;
  const elapsed=f.frames;
  let outcome;
  if(pd<0.40&&elapsed<58)outcome='groundout';       // 浅い所を素早く処理した時だけアウト
  else if(pd<0.52)outcome=elapsed>110?'double':'single';
  else if(pd<0.78)outcome='single';
  else{
    const corner=Math.abs(px)>0.5;
    outcome=(f.wallHit&&corner)||elapsed>180?'triple':'double';
  }
  settle(outcome);
}
function settle(outcome){
  G.fly.judged=true;G.fly.outcome=outcome;
  if(outcome==='hr')G.fly.phase='gone';
  finishPlay(outcome);
}

// ---------- 結果処理 ----------
// 塁パス: 0=ホーム,1=一塁,2=二塁,3=三塁,4=ホーム(生還)
const BASE_PATH=[[0,0.035],[0.25,0.29],[0,0.5],[-0.25,0.29],[0,0.035]];
function pathPos(v){
  const i=Math.min(3,Math.floor(v)),t=v-i;
  const a=BASE_PATH[i],b=BASE_PATH[i+1];
  return{fx:a[0]+(b[0]-a[0])*t,fd:a[1]+(b[1]-a[1])*t};
}
const RUN_SPEED=0.02; // 1塁間 ≒ 50フレーム
function vizAt(base){return G.viz.find(r=>r.base===base);}
function runnersSettled(){return G.viz.every(r=>r.v>=r.targetV-1e-6);}
function stepRunners(){
  for(const r of G.viz){
    if(r.v<r.targetV)r.v=Math.min(r.targetV,r.v+RUN_SPEED);
    // ★ホームイン: 得点加算+中央に「0→1」演出
    if(r.base==='scored'&&!r.counted&&r.v>=3.999){
      r.counted=true;
      const from=G.score; G.score++;
      G.scorePops.push({from,to:G.score,t:0});
      updateHUD();
      beep(720,.16,'sine',.18,260);
      setTimeout(()=>beep(980,.2,'sine',.16,180),90);
      // ホームベース上に小さな祝砲
      const hp=proj(0,0.035);
      for(let i=0;i<14;i++)G.particles.push({x:hp.x,y:hp.y-8,
        vx:(Math.random()*2-1)*4,vy:-Math.random()*5-1,
        life:26+Math.random()*18,c:'#f2b632',s:2+Math.random()*2.5});
    }
  }
  // 生還した走者を除去
  G.viz=G.viz.filter(r=>!(r.base==='scored'&&r.v>=3.999&&r.counted));
}
function advanceRunners(n){
  let runs=0;
  // 既存走者(3塁から順に)
  for(let b=2;b>=0;b--){
    if(!G.bases[b])continue;
    const r=vizAt(b);
    const nb=b+n;
    if(nb>=3){runs++;if(r){r.targetV=4;r.base='scored';}}
    else{if(r){r.targetV=nb+1;r.base=nb;}}
    G.bases[b]=false;
  }
  // ロジック上の塁を更新
  for(const r of G.viz)if(r.base!=='scored')G.bases[r.base]=true;
  // 打者走者
  G.batterGone=true; // 打者はランナーとして表示
  if(n>=4){runs++;G.viz.push({v:0,targetV:4,base:'scored'});}
  else{G.viz.push({v:0,targetV:n,base:n-1});G.bases[n-1]=true;}
  return runs;
}
function walk(){
  let runs=0;
  // 押し出しの連鎖: 塁が詰まっている分だけ進む
  const forced=[true,G.bases[0],G.bases[0]&&G.bases[1]]; // 打者,1塁,2塁走者が動くか
  if(G.bases[0]&&G.bases[1]&&G.bases[2]){ // 3塁走者押し出し
    const r=vizAt(2);if(r){r.targetV=4;r.base='scored';}
    G.bases[2]=false;runs=1;
  }
  if(forced[2]&&G.bases[1]){const r=vizAt(1);if(r){r.targetV=3;r.base=2;}G.bases[1]=false;G.bases[2]=true;}
  if(forced[1]&&G.bases[0]){const r=vizAt(0);if(r){r.targetV=2;r.base=1;}G.bases[0]=false;G.bases[1]=true;}
  G.viz.push({v:0,targetV:1,base:0});G.bases[0]=true;
  G.batterGone=true; // 打者はランナーとして表示
  cam.target=1; // 四球の歩きも広角で見せる
  return runs;
}
function finishPlay(outcome){
  let runs=0,msg='',cls=null;
  switch(outcome){
    case 'hr':
      runs=advanceRunners(4);G.hr++;G.hits++;cls='hr';
      msg=runs>1?`${runs}ラン ホームラン!!`:'ホームラン!!';
      crowd();for(let i=0;i<3;i++)setTimeout(spawnFirework,i*260);
      break;
    case 'triple':runs=advanceRunners(3);G.hits++;msg='三塁打!!';beep(650,.18,'triangle',.16,250);break;
    case 'double':runs=advanceRunners(2);G.hits++;msg='二塁打!';beep(600,.15,'triangle',.15,200);break;
    case 'single':runs=advanceRunners(1);G.hits++;msg='ヒット!';beep(520,.12,'triangle',.13,150);break;
    case 'flyout':G.outs++;msg='フライアウト!';cls='out';beep(300,.2,'sine',.12,-100);G.balls=0;G.strikes=0;break;
    case 'foulflyout':G.outs++;msg='ファウルフライ捕球!';cls='out';beep(300,.2,'sine',.12,-100);G.balls=0;G.strikes=0;break;
    case 'groundout':G.outs++;msg='ゴロアウト!';cls='out';beep(170,.25,'square',.14,-60);G.balls=0;G.strikes=0;break;
    case 'foul':if(G.strikes<2)G.strikes++;msg='ファウル';beep(240,.15,'sawtooth',.1,-60);break;
    case 'walk':runs=walk();G.balls=0;G.strikes=0;msg='フォアボール';beep(480,.2,'sine',.14,120);break;
    case 'hbp':runs=walk();G.balls=0;G.strikes=0;msg='デッドボール!';beep(200,.25,'square',.14,-40);break;
  }
  // 得点はランナーがホームを踏んだ瞬間に加算(stepRunnersで処理)
  if(['hr','triple','double','single'].includes(outcome)){G.balls=0;G.strikes=0;}
  showMsg(msg,cls);
  G.speedMul=Math.min(1.8,1+(G.hits+G.hr*2)*.045);
  updateHUD();
  if(G.outs>=3){setTimeout(gameOver,1100);G.resultDelay=9999;return;}
  G.resultDelay=outcome==='hr'?95:70;
}
function ballOrStrikeAtPlate(){
  if(G.swung){G.strikes++;beep(160,.22,'square',.15,-60);showMsg('空振り!');}
  else if(G.pitch.inZone){G.strikes++;beep(160,.22,'square',.15,-60);showMsg('ストライク!');}
  else{
    G.balls++;beep(380,.12,'sine',.1);showMsg('ボール');
    if(G.balls>=4){G.pitch=null;G.state='result';G.t=0;finishPlay('walk');return;}
  }
  if(G.strikes>=3){
    G.strikes=0;G.balls=0;G.outs++;showMsg('三振!','out');
    if(G.outs>=3){updateHUD();setTimeout(gameOver,900);G.pitch=null;G.state='result';G.resultDelay=9999;return;}
  }
  updateHUD();
  G.pitch=null;G.state='result';G.t=0;G.resultDelay=45;
}
function gameOver(){
  G.state='over';
  $('finalScore').textContent=G.score;
  $('finalDetail').textContent=`安打 ${G.hits} / ホームラン ${G.hr} 本`;
  $('over').style.display='flex';
}
function spawnFirework(){
  const x=120+Math.random()*560,y=50+Math.random()*100,hue=Math.random()*360;
  for(let i=0;i<46;i++){const a=Math.PI*2*i/46,sp=2+Math.random()*2.5;
    G.fireworks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:50+Math.random()*25,hue});}
  beep(80,.3,'sine',.2,300);
}

// ============================================================
//  Drawing — 捕手後方カメラ
// ============================================================
function drawField(){
  // 空
  const sky=cx.createLinearGradient(0,0,0,HORIZON);
  sky.addColorStop(0,'#0a1424');sky.addColorStop(1,'#16263f');
  cx.fillStyle=sky;cx.fillRect(0,0,W,HORIZON);
  cx.fillStyle='rgba(255,255,255,.55)';
  for(let i=0;i<36;i++)cx.fillRect((i*97)%W,(i*53)%90,1.4,1.4);
  // 照明塔
  for(const lx of [70,730]){
    cx.fillStyle='#33425c';cx.fillRect(lx-3,55,6,110);
    cx.fillStyle='#e8f0fb';
    for(let r=0;r<3;r++)for(let c=0;c<4;c++)cx.fillRect(lx-20+c*11,32+r*8,8,6);
    const gl=cx.createRadialGradient(lx,44,4,lx,44,100);
    gl.addColorStop(0,'rgba(230,240,255,.3)');gl.addColorStop(1,'rgba(230,240,255,0)');
    cx.fillStyle=gl;cx.beginPath();cx.arc(lx,44,100,0,7);cx.fill();
  }
  // フェンス位置(投影から算出)
  const fenceB=proj(0,1).y, wallTop=fenceB-24;
  // 外野スタンド(観客)
  cx.fillStyle='#233248';cx.fillRect(0,wallTop-50,W,50);
  for(let i=0;i<260;i++){
    const x=(i*29.7)%W, y=wallTop-46+((i*7)%40);
    cx.fillStyle=`hsl(${(i*47)%360},38%,${42+(i%3)*9}%)`;
    cx.fillRect(x,y,2.6,2.6);
  }
  // 外野フェンス(壁) — 看板つき
  cx.fillStyle='#123a26';cx.fillRect(0,wallTop,W,fenceB-wallTop);
  cx.font='bold 12px sans-serif';cx.textAlign='center';
  const ads=['NIGHT CUP','⚾ STADIUM','HOMERUN','GO! GO!','STRIKE!'];
  for(let i=0;i<5;i++){
    cx.fillStyle=i%2?'#1a4530':'#16402b';
    cx.fillRect(20+i*155,wallTop+3,140,18);
    cx.fillStyle=i%2?'#f2b632':'#cfd8e6';
    cx.fillText(ads[i],90+i*155,wallTop+17);
  }
  cx.fillStyle='#f2b632';cx.fillRect(0,wallTop-2,W,2); // HRライン
  // グラウンド(芝)
  const gr=cx.createLinearGradient(0,fenceB,0,H);
  gr.addColorStop(0,'#2a6b45');gr.addColorStop(1,'#174a2f');
  cx.fillStyle=gr;cx.fillRect(0,fenceB,W,H-fenceB);
  // 芝の刈り模様(遠近)
  cx.fillStyle='rgba(255,255,255,.045)';
  for(let i=0;i<6;i++){
    const d1=0.95-i*0.15,d2=d1-0.075;
    if(d2<0)break;
    const p1=proj(-1.6,d1),p2=proj(1.6,d1),p3=proj(1.6,d2),p4=proj(-1.6,d2);
    cx.beginPath();cx.moveTo(p1.x,p1.y);cx.lineTo(p2.x,p2.y);cx.lineTo(p3.x,p3.y);cx.lineTo(p4.x,p4.y);cx.closePath();cx.fill();
  }
  // 内野の土: きれいなダイヤモンド(投影した4頂点+膨らみ)
  cx.fillStyle='#8a6642';
  {
    const h=proj(0,0.015),r1=proj(0.34,0.30),s2=proj(0,0.62),l1=proj(-0.34,0.30);
    cx.beginPath();
    cx.moveTo(h.x,h.y+22);
    cx.quadraticCurveTo((h.x+r1.x)/2+40,(h.y+r1.y)/2+14,r1.x,r1.y);
    cx.quadraticCurveTo((r1.x+s2.x)/2+26,(r1.y+s2.y)/2-6,s2.x,s2.y);
    cx.quadraticCurveTo((s2.x+l1.x)/2-26,(l1.y+s2.y)/2-6,l1.x,l1.y);
    cx.quadraticCurveTo((h.x+l1.x)/2-40,(h.y+l1.y)/2+14,h.x,h.y+22);
    cx.closePath();cx.fill();
  }
  // マウンド
  {
    const m=proj(MOUND.fx,MOUND.fd);
    const cs=camNow().size;
    cx.fillStyle='#96714b';
    cx.beginPath();cx.ellipse(m.x,m.y,(34*m.scale+8)*cs,(12*m.scale+3)*cs,0,0,7);cx.fill();
    cx.fillStyle='#e8e4d8';cx.fillRect(m.x-6*cs,m.y-2,12*cs,3);
  }
  // ベース
  for(const[bfx,bfd]of[[0.25,0.29],[0,0.5],[-0.25,0.29]]){
    const b=proj(bfx,bfd);
    if(b.x<-30||b.x>W+30)continue;
    cx.save();cx.translate(b.x,b.y);cx.rotate(Math.PI/4);
    const s=(7*b.scale+3)*camNow().size;
    cx.fillStyle='#e8e4d8';cx.fillRect(-s/2,-s/2,s,s);
    cx.restore();
  }
  // ファウルライン(フェア境界 |fx| = fd*1.05 に沿って投影曲線で描く)
  cx.strokeStyle='rgba(232,228,216,.85)';cx.lineWidth=3;
  for(const sgn of [1,-1]){
    cx.beginPath();
    let first=true;
    for(let d=0.03;d<=1.001;d+=0.05){
      const p=proj(sgn*d*1.05,d);
      if(first){cx.moveTo(p.x,p.y);first=false;}else cx.lineTo(p.x,p.y);
    }
    cx.stroke();
  }
  // ホームプレート周りの土&プレート&バッターボックス(手前・大きく)
  cx.fillStyle='#8a6642';
  cx.beginPath();cx.ellipse(400,PLATE_Y+18,240,58,0,0,7);cx.fill();
  cx.fillStyle='#e8e4d8';
  cx.beginPath();
  cx.moveTo(370,PLATE_Y+8);cx.lineTo(430,PLATE_Y+8);cx.lineTo(430,PLATE_Y+22);
  cx.lineTo(400,PLATE_Y+34);cx.lineTo(370,PLATE_Y+22);cx.closePath();cx.fill();
  cx.strokeStyle='rgba(232,228,216,.75)';cx.lineWidth=3;
  cx.strokeRect(230,PLATE_Y-18,105,64);
  cx.strokeRect(465,PLATE_Y-18,105,64);
}
// 野手(奥行きスケール付き)
function drawFielder(fd){
  const p=proj(fd.fx,fd.fd);
  if(p.x<-40||p.x>W+40)return; // 画角外はスキップ
  const s=p.scale*2.3*camNow().size;
  cx.save();cx.translate(p.x,p.y);cx.scale(s,s);
  cx.fillStyle='rgba(0,0,0,.25)';
  cx.beginPath();cx.ellipse(0,2,8,2.8,0,0,7);cx.fill();
  cx.strokeStyle=fd.chasing?'#ffd76e':'#c8d2e0';cx.lineWidth=3;cx.lineCap='round';
  cx.beginPath();cx.moveTo(0,0);cx.lineTo(0,-13);cx.stroke();
  cx.beginPath();cx.moveTo(0,-4);cx.lineTo(-6,3);cx.stroke();
  cx.beginPath();cx.moveTo(0,-4);cx.lineTo(6,3);cx.stroke();
  const up=fd.chasing&&G.fly&&G.fly.phase==='fly'&&G.fly.z<30;
  cx.beginPath();cx.moveTo(0,-11);cx.lineTo(-6,up?-19:-6);cx.stroke();
  cx.beginPath();cx.moveTo(0,-11);cx.lineTo(6,up?-19:-6);cx.stroke();
  cx.fillStyle='#e8ceac';cx.beginPath();cx.arc(0,-18,5,0,7);cx.fill();
  cx.fillStyle='#d94f3d';cx.beginPath();cx.arc(0,-19.5,5.2,Math.PI,Math.PI*2);cx.fill();
  cx.fillStyle='#8a5a2b';cx.beginPath();cx.arc(-7,up?-20:-5,3.4,0,7);cx.fill();
  if(fd.hasBall){cx.fillStyle='#fff';cx.beginPath();cx.arc(-7,up?-20:-5,2.2,0,7);cx.fill();}
  cx.restore();
}
// 投手(マウンド上・投球モーション)
function drawPitcher(){
  const m=proj(MOUND.fx,MOUND.fd);
  const s=m.scale*2.4*camNow().size;
  let phase=0;
  if(G.state==='windup')phase=Math.min(1,G.t/WINDUP_LEN);
  else if(G.state==='pitch'&&G.pitch&&G.pitch.p<.15)phase=1+G.pitch.p*6;
  cx.save();cx.translate(m.x,m.y);cx.scale(s,s);
  cx.strokeStyle='#dfe4ec';cx.lineWidth=3.4;cx.lineCap='round';cx.fillStyle='#dfe4ec';
  const lift=Math.sin(Math.min(phase,1)*Math.PI)*(phase<=1?1:0);
  const lean=phase<=1?phase*0.25:0.25-(phase-1)*0.9;
  cx.rotate(lean*.35); // 正面向きなのでこちらに倒れ込む
  cx.beginPath();cx.moveTo(0,0);cx.lineTo(0,-20);cx.stroke();
  cx.beginPath();cx.arc(0,-26,6,0,7);cx.fill();
  cx.fillStyle='#d94f3d';cx.fillRect(-6,-32,12,4);
  cx.fillStyle='#dfe4ec';
  // 足
  cx.beginPath();cx.moveTo(0,0);cx.lineTo(-7-lift*6,8-lift*16);cx.lineTo(-9-lift*3,17-lift*18);cx.stroke();
  cx.beginPath();cx.moveTo(0,0);cx.lineTo(7,9);cx.lineTo(9,18);cx.stroke();
  // 投球腕(頭上→こちらへ振り下ろす)
  let armA;
  if(phase<=1)armA=-1.9-phase*0.9;else armA=-2.8+(phase-1)*6;
  const ax=Math.cos(armA)*15,ay=Math.sin(armA)*15;
  cx.beginPath();cx.moveTo(0,-17);cx.lineTo(ax,-17+ay);cx.stroke();
  cx.beginPath();cx.moveTo(0,-17);cx.lineTo(-12,-11+lift*-5);cx.stroke();
  cx.fillStyle='#8a5a2b';cx.beginPath();cx.arc(-14,-11+lift*-5,4,0,7);cx.fill();
  if(G.state==='windup'){
    cx.fillStyle='#fff';cx.beginPath();cx.arc(ax,-17+ay,3,0,7);cx.fill();
  }
  cx.restore();
}
// 手前の大きなバッター(背面ビュー・右打者=画面左寄り)
function drawBatter(){
  if(G.batterGone)return; // 走者として表示中
  cx.save();cx.translate(284,PLATE_Y+14);cx.scale(2.9,2.9);
  const sw=G.swing;
  // 構え -1.5(ほぼ垂直に立てる=ゾーンと被らない) → 右横0(インパクト) → +3.98(左上)でフィニッシュ
  let batAng=-1.5, lean=0;
  if(sw>=0){
    const t=Math.min(1,sw/10);
    const e=1-Math.pow(1-t,3);
    batAng=-1.5+e*5.48; lean=e*0.45;
  }
  cx.rotate(lean*.22);
  // 影
  cx.fillStyle='rgba(0,0,0,.3)';
  cx.beginPath();cx.ellipse(2,4,16,4,0,0,7);cx.fill();
  // 足(背面)
  cx.strokeStyle='#e8e4d8';cx.lineWidth=5;cx.lineCap='round';
  cx.beginPath();cx.moveTo(-1,-16);cx.lineTo(-7,-2);cx.lineTo(-8,4);cx.stroke();
  cx.beginPath();cx.moveTo(-1,-16);cx.lineTo(7,-1);cx.lineTo(9,4);cx.stroke();
  // 胴体(ユニフォーム背中)
  cx.strokeStyle='#2b3a55';cx.lineWidth=9;
  cx.beginPath();cx.moveTo(-1,-16);cx.lineTo(1,-34);cx.stroke();
  // 背番号
  cx.fillStyle='#ffffff';cx.font='bold 8px sans-serif';cx.textAlign='center';
  cx.fillText('D',0,-22);
  // 頭+ヘルメット(後頭部)
  cx.fillStyle='#e8ceac';cx.beginPath();cx.arc(2,-41,6.5,0,7);cx.fill();
  cx.fillStyle='#1a2740';cx.beginPath();cx.arc(2,-42,7,Math.PI*.85,Math.PI*2.35);cx.fill();
  // 腕(両手でグリップ)
  cx.strokeStyle='#e8ceac';cx.lineWidth=4.5;
  const gx=8+Math.cos(batAng)*5, gy=-33+Math.sin(batAng)*5;
  cx.beginPath();cx.moveTo(-2,-31);cx.lineTo(gx,gy);cx.stroke();
  cx.beginPath();cx.moveTo(4,-30);cx.lineTo(gx,gy);cx.stroke();
  // バット
  cx.strokeStyle='#c99a5b';cx.lineWidth=5;
  cx.beginPath();cx.moveTo(gx,gy);
  cx.lineTo(gx+Math.cos(batAng)*34,gy+Math.sin(batAng)*34);cx.stroke();
  cx.fillStyle='#a87c45';cx.beginPath();cx.arc(gx,gy,3,0,7);cx.fill();
  // スイング残像
  if(sw>=0&&sw<8){
    cx.lineWidth=2.5;
    for(let i=1;i<=4;i++){
      const a=batAng-i*.55;if(a<-1.5)continue;
      cx.strokeStyle=`rgba(255,255,255,${.3-i*.06})`;
      cx.beginPath();cx.moveTo(gx,gy);cx.lineTo(gx+Math.cos(a)*34,gy+Math.sin(a)*34);cx.stroke();
    }
  }
  cx.restore();
}
// 塁上のランナー(自チーム=紺ユニ) — 塁パスに沿ってアニメーション
function drawRunners(){
  for(const r of G.viz){
    const pp=pathPos(r.v);
    const moving=r.v<r.targetV-1e-6;
    // 停止時はベース脇に立つ(2塁だけ左側、他は右側)
    const off=moving?0:(r.base===1?-0.03:0.03);
    const p=proj(pp.fx+off,pp.fd+(moving?0:0.015));
    if(p.x<-40||p.x>W+40)continue; // 望遠時は画角内の走者のみ
    const s=p.scale*2.3*camNow().size;
    const ph=moving?Math.sin(G.t*.55)*1:0; // 走りの足振り
    cx.save();cx.translate(p.x,p.y);cx.scale(s,s);
    cx.fillStyle='rgba(0,0,0,.25)';
    cx.beginPath();cx.ellipse(0,2,8,2.8,0,0,7);cx.fill();
    // 脚(走行時は交互に振る)
    cx.strokeStyle='#e8e4d8';cx.lineWidth=3;cx.lineCap='round';
    cx.beginPath();cx.moveTo(0,-4);cx.lineTo(-5+ph*3,3-Math.abs(ph)*1.5);cx.stroke();
    cx.beginPath();cx.moveTo(0,-4);cx.lineTo(5-ph*3,3-Math.abs(ph)*1.5);cx.stroke();
    // 体(紺ユニ・走行時は前傾)
    cx.strokeStyle='#2b3a55';cx.lineWidth=3.6;
    cx.save();if(moving)cx.rotate(.18);
    cx.beginPath();cx.moveTo(0,-3);cx.lineTo(0,-13);cx.stroke();
    // 腕(走行時は振る/停止時はリード構え)
    cx.strokeStyle='#e8ceac';cx.lineWidth=2.6;
    if(moving){
      cx.beginPath();cx.moveTo(0,-11);cx.lineTo(-5-ph*2.5,-8);cx.stroke();
      cx.beginPath();cx.moveTo(0,-11);cx.lineTo(5+ph*2.5,-8);cx.stroke();
    }else{
      cx.beginPath();cx.moveTo(0,-11);cx.lineTo(-7,-9);cx.stroke();
      cx.beginPath();cx.moveTo(0,-11);cx.lineTo(7,-9);cx.stroke();
    }
    // 頭+ヘルメット(紺)
    cx.fillStyle='#e8ceac';cx.beginPath();cx.arc(0,-18,5,0,7);cx.fill();
    cx.fillStyle='#1a2740';cx.beginPath();cx.arc(0,-19.5,5.4,Math.PI*.9,Math.PI*2.1);cx.fill();
    cx.restore();cx.restore();
  }
}
function drawZone(){
  if(G.state!=='windup'&&G.state!=='pitch')return;
  const z=ZONE;
  cx.save();
  cx.strokeStyle='rgba(230,238,248,.9)';cx.lineWidth=2;
  cx.fillStyle='rgba(20,40,70,.18)';
  cx.fillRect(z.x-z.w/2,z.y-z.h/2,z.w,z.h);
  cx.strokeRect(z.x-z.w/2,z.y-z.h/2,z.w,z.h);
  cx.strokeStyle='rgba(230,238,248,.25)';cx.lineWidth=1;
  for(let i=1;i<3;i++){
    cx.beginPath();cx.moveTo(z.x-z.w/2+z.w*i/3,z.y-z.h/2);cx.lineTo(z.x-z.w/2+z.w*i/3,z.y+z.h/2);cx.stroke();
    cx.beginPath();cx.moveTo(z.x-z.w/2,z.y-z.h/2+z.h*i/3);cx.lineTo(z.x+z.w/2,z.y-z.h/2+z.h*i/3);cx.stroke();
  }
  cx.restore();
}
function drawCursor(){
  if(G.state!=='windup'&&G.state!=='pitch')return;
  const c=G.cursor;
  cx.save();
  // プロスピ風: 横長のミート楕円+中心サークル
  cx.strokeStyle='rgba(160,210,255,.9)';cx.lineWidth=2.5;
  cx.fillStyle='rgba(140,195,250,.22)';
  cx.beginPath();cx.ellipse(c.x,c.y,c.r*1.7,c.r*.62,0,0,7);cx.fill();cx.stroke();
  cx.strokeStyle='#3fe07a';cx.lineWidth=3;
  cx.beginPath();cx.arc(c.x,c.y,10,0,7);cx.stroke();
  cx.fillStyle='#3fe07a';cx.beginPath();cx.arc(c.x,c.y,2.5,0,7);cx.fill();
  cx.restore();
}
function drawBall(x,y,r){
  cx.fillStyle='#fff';cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();
  cx.strokeStyle='#d94f3d';cx.lineWidth=Math.max(1,r*.18);
  cx.beginPath();cx.arc(x,y,r*.7,-.7,1.1);cx.stroke();
  cx.beginPath();cx.arc(x,y,r*.7,Math.PI-.7,Math.PI+1.1);cx.stroke();
}
function drawHitBall(){
  const f=G.fly;if(!f)return;
  for(let i=0;i<f.trail.length;i++){
    const tr=f.trail[i];
    cx.fillStyle=f.q>.8?`rgba(242,182,50,${i/f.trail.length*.5})`:`rgba(255,255,255,${i/f.trail.length*.35})`;
    cx.beginPath();cx.arc(tr.x,tr.y,(2+i*.25)*Math.max(.4,tr.s),0,7);cx.fill();
  }
  const p=proj(f.fx,Math.min(1.14,f.fd));
  const cs=camNow().size;
  if(f.phase!=='gone'&&f.fd<1){
    cx.fillStyle='rgba(0,0,0,.3)';
    cx.beginPath();cx.ellipse(p.x,p.y,(5*p.scale+1.5)*cs,(2*p.scale+.6)*cs,0,0,7);cx.fill();
  }
  const bx=p.x, by=p.y-f.z*7*p.scale*cs;
  drawBall(bx,by,Math.max(2.2,9*p.scale*cs));
}

// ---------- Loop ----------
function step(){
  G.t++;
  // カメラ補間(打った瞬間は素早く広角へ、戻りはゆったり)
  const camSpd=cam.target>cam.k?0.075:0.05;
  if(cam.k<cam.target)cam.k=Math.min(cam.target,cam.k+camSpd);
  else if(cam.k>cam.target)cam.k=Math.max(cam.target,cam.k-camSpd);
  let sx=0,sy=0;
  if(G.shake>0){G.shake*=.85;sx=(Math.random()*2-1)*G.shake;sy=(Math.random()*2-1)*G.shake;if(G.shake<.5)G.shake=0;}
  cx.save();cx.translate(sx,sy);
  drawField();
  // 奥から順に描画
  const sorted=[...G.fielders].sort((a,b)=>a.fd===b.fd?0:b.fd-a.fd);
  for(const fd of sorted){
    if(fd.name==='投'&&(G.state==='windup'||G.state==='pitch'))continue;
    drawFielder(fd);
  }
  if(G.state==='windup'||G.state==='pitch')drawPitcher();
  drawRunners();
  drawZone();

  if(G.state==='windup'){
    if(G.t>WINDUP_LEN*.45){
      cx.fillStyle='rgba(232,228,216,.9)';cx.font='bold 14px sans-serif';cx.textAlign='center';
      const m=proj(MOUND.fx,MOUND.fd);
      cx.fillText(PITCHES[G.pitchType].name,m.x,m.y-70*m.scale-24);
    }
    if(G.t>=WINDUP_LEN)toPitch();
  }
  else if(G.state==='pitch'){
    G.pitch.p+=G.pitch.speed;
    const pos=pitchPos(G.pitch.p);
    cx.fillStyle='rgba(255,255,255,.18)';
    for(let i=1;i<=3;i++){const pp=pitchPos(Math.max(0,G.pitch.p-i*.03));
      cx.beginPath();cx.arc(pp.x,pp.y,pp.r*.8,0,7);cx.fill();}
    drawBall(pos.x,pos.y,pos.r);
    // ★デッドボール判定: 見逃した球が打者の体を直撃
    if(!G.swung&&G.pitch.p>0.9&&
       pos.x>245&&pos.x<318&&pos.y>PLATE_Y-130&&pos.y<PLATE_Y+12){
      G.pitch=null;G.shake=8;
      beep(120,.18,'square',.25,-50);beep(300,.08,'sawtooth',.15,-150);
      G.state='result';G.t=0;
      finishPlay('hbp');
    }
    else if(G.pitch.p>=1.06)ballOrStrikeAtPlate();
  }
  else if(G.state==='hitfly'){
    if(!G.fly.judged)stepHitBall();
    else if(G.fly.phase==='gone'){
      G.fly.fx+=G.fly.vfx;G.fly.fd+=G.fly.vd*.6;G.fly.z+=G.fly.vz;G.fly.vz-=G.fly.g*.5;
      const sp=proj(G.fly.fx,Math.min(1.14,G.fly.fd));
      G.fly.trail.push({x:sp.x,y:sp.y-G.fly.z*7*sp.scale,s:sp.scale});
      if(G.fly.trail.length>14)G.fly.trail.shift();
    }
    drawHitBall();
    if(G.fly.judged){
      if(G.t>(G.fly.outcome==='hr'?95:70)&&runnersSettled()&&G.scorePops.length===0&&G.outs<3&&G.resultDelay!==9999)toWindup();
    }
  }
  else if(G.state==='result'){
    if(G.t>=G.resultDelay&&runnersSettled()&&G.scorePops.length===0&&G.outs<3)toWindup();
  }
  stepRunners();

  drawBatter();
  drawCursor();
  if(G.swing>=0)G.swing++; // フォロースルーは次の打席まで維持

  G.particles=G.particles.filter(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.life--;
    cx.fillStyle=p.c;cx.globalAlpha=Math.max(0,p.life/40);
    cx.fillRect(p.x,p.y,p.s,p.s);cx.globalAlpha=1;return p.life>0;});
  G.fireworks=G.fireworks.filter(p=>{
    p.x+=p.vx;p.y+=p.vy;p.vy+=.03;p.vx*=.985;p.life--;
    cx.fillStyle=`hsla(${p.hue+p.life*2},90%,${55+Math.random()*20}%,${Math.max(0,p.life/60)})`;
    cx.fillRect(p.x,p.y,2.5,2.5);return p.life>0;});

  // 得点アップ演出: 数字が 3 から 4 へロールして切り替わる(画面中央)
  G.scorePops=G.scorePops.filter(sp=>{
    sp.t++;
    const T=sp.t, DUR=96;
    if(T>DUR)return false;
    let sc=1,al=1;
    if(T<10){sc=0.4+(T/10)*0.7;al=T/10;}       // ポップイン(旧スコア表示)
    else if(T>78){al=1-(T-78)/18;sc=1.06;}      // フェードアウト
    // ロール進行: T=22〜44 で旧→新へ切り替え
    let roll=0;
    if(T>=22)roll=Math.min(1,(T-22)/22);
    const re=roll<.5?2*roll*roll:1-Math.pow(-2*roll+2,2)/2; // easeInOut
    cx.save();
    cx.translate(400,236);cx.scale(sc,sc);cx.globalAlpha=al;
    cx.font='italic 900 26px sans-serif';cx.textAlign='center';cx.textBaseline='middle';
    cx.lineWidth=6;cx.strokeStyle='rgba(0,0,0,.55)';
    cx.strokeText('SCORE!',0,-52);
    cx.fillStyle='rgba(255,255,255,.95)';cx.fillText('SCORE!',0,-52);
    // 数字ロール(クリップ窓の中で旧が上へ抜け、新が下から入る)
    cx.beginPath();cx.rect(-120,-42,240,84);cx.clip();
    cx.font='italic 900 66px sans-serif';
    const drawNum=(n,dy,a)=>{
      cx.globalAlpha=al*a;
      cx.lineWidth=9;cx.strokeStyle='rgba(0,0,0,.55)';
      cx.strokeText(n,0,dy);
      cx.fillStyle=a<1?'#f2b632':'#f2b632';cx.fillText(n,0,dy);
    };
    if(re<1)drawNum(sp.from,-re*80,1-re);       // 旧スコア: 上へスライドして消える
    if(re>0){
      // 新スコア: 下から入り、確定時に白く光る
      const flash=T>=44&&T<58?(1-(T-44)/14):0;
      cx.globalAlpha=al*re;
      cx.lineWidth=9;cx.strokeStyle='rgba(0,0,0,.55)';
      cx.strokeText(sp.to,0,80-re*80);
      cx.fillStyle='#f2b632';cx.fillText(sp.to,0,80-re*80);
      if(flash>0){cx.fillStyle=`rgba(255,255,255,${flash*.85})`;cx.fillText(sp.to,0,80-re*80);}
    }
    cx.restore();cx.globalAlpha=1;
    return true;
  });

  cx.restore();
  requestAnimationFrame(step);
}
drawField();drawBatter();
requestAnimationFrame(step);

// ---------- 表示サイズ&全画面切り替え ----------
const wrap=document.getElementById('wrap'),fsBtn=$('fsBtn');
function isFull(){return document.fullscreenElement===wrap||wrap.classList.contains('fakefull');}
function fit(){
  if(isFull()){
    // 全画面: 画面に収まる最大サイズ(アスペクト維持)
    const s=Math.min(innerWidth/W,innerHeight/H);
    cv.style.width=W*s+'px';cv.style.height=H*s+'px';
  }else{
    // 通常: ページ横幅いっぱい(高さは自動)
    cv.style.width='100%';cv.style.height='auto';
  }
  fsBtn.textContent=isFull()?'✕':'⛶';
  fsBtn.title=isFull()?'全画面を終了':'全画面表示';
}
fsBtn.addEventListener('click',async()=>{
  if(isFull()){
    if(document.fullscreenElement){try{await document.exitFullscreen();}catch(e){}}
    wrap.classList.remove('fakefull');
  }else{
    try{await wrap.requestFullscreen();}
    catch(e){wrap.classList.add('fakefull');} // iOS等のフォールバック
  }
  fit();
});
document.addEventListener('fullscreenchange',fit);
addEventListener('resize',fit);fit();
})();