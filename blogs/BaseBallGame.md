---
title: 野球ゲーム
date: "2023-06-07 00:00:00"
update: "2026-07-16 20:30:00"
category: "Blog"
hero: https://cdn.pixabay.com/photo/2016/11/22/22/17/action-1850887_1280.jpg
tags: ["JavaScript"]
layout: blog
excerpt: '<span style="color: #42b983;">[遊べます！] </span>3D野球ゲーム'
---

学生の特権を使ってGithub PROアカウントになり，Github Copilotを試してたら楽しくなって作ってしまった<a href="https://github.com/Absolute-Value/BaseBallGame" target="_blank"><b>コチラ</b></a>の野球ゲームのpythonコードをJavaScriptに移行してみました．  
話題のClaude Fable 5を使って3Dゲームにしました．ファイルラインとフェアゾーンが一致していなかったり、内野が外野まで追っかけたり、完ぺきではないところがまた良いです。  
ゲーム画面が表示されない場合はReloadしてみてください．

<a href="https://github.com/Absolute-Value/BaseBallJS" target="_blank"><b>Github リポジトリ</b></a>

<head>
<style>
  :root{--night:#0d1b2e;--gold:#f2b632;--red:#d94f3d;--blue:#7ec8ff;--ink:#e8e4d8;}
  #wrap,#wrap *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  #wrap{overflow:hidden;background:var(--night);
    font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",system-ui,sans-serif;user-select:none;}
  /* 基本: ページの横幅いっぱいに表示(埋め込み向け) */
  #wrap{position:relative;width:100%;display:flex;align-items:center;justify-content:center;}
  canvas{display:block;width:100%;height:auto;cursor:none;box-shadow:0 0 80px rgba(0,0,0,.6);touch-action:none;}
  /* 全画面時(Fullscreen API / 疑似フルスクリーン共通) */
  #wrap:fullscreen,#wrap.fakefull{position:fixed;inset:0;width:100vw;height:100vh;background:var(--night);z-index:999;}
  #wrap:fullscreen canvas,#wrap.fakefull canvas{width:auto;height:auto;max-width:100vw;max-height:100vh;}
  #fsBtn,#volBtn{position:absolute;bottom:12px;z-index:20;
    width:44px;height:44px;border-radius:10px;border:1px solid rgba(242,182,50,.5);
    background:rgba(6,12,22,.8);color:var(--gold);font-size:20px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:background .15s;}
  #fsBtn{right:12px;}
  #volBtn{right:64px;}
  #fsBtn:hover,#volBtn:hover{background:rgba(20,32,52,.9);}
  #msg{position:absolute;top:26%;left:50%;transform:translate(-50%,-50%);
    font-size:min(11vw,68px);font-weight:900;letter-spacing:.05em;font-style:italic;
    color:var(--gold);text-shadow:0 0 24px rgba(242,182,50,.65),0 4px 0 rgba(0,0,0,.5);
    opacity:0;pointer-events:none;z-index:6;white-space:nowrap;}
  #msg.show{animation:pop .95s ease-out forwards;}
  #msg.hr{color:#fff;text-shadow:0 0 30px var(--gold),0 0 60px var(--red),0 4px 0 rgba(0,0,0,.5);}
  #msg.out{color:var(--blue);text-shadow:0 0 24px rgba(126,200,255,.6),0 4px 0 rgba(0,0,0,.5);}
  @keyframes pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.4);}
    18%{opacity:1;transform:translate(-50%,-50%) scale(1.15);}
    30%{transform:translate(-50%,-50%) scale(1);}80%{opacity:1;}
    100%{opacity:0;transform:translate(-50%,-52%) scale(1.02);}}
  #start,#over{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:14px;z-index:10;background:rgba(8,14,26,.9);color:var(--ink);
    text-align:center;padding:20px;}
  #start h1,#over h1{font-size:min(8vw,48px);font-weight:900;font-style:italic;color:var(--gold);
    letter-spacing:.04em;text-shadow:0 0 30px rgba(242,182,50,.5);}
  .sub{color:#9db2c8;font-size:13.5px;line-height:2;}
  .sub b{color:var(--ink);}
  #wrap .btn{margin-top:8px;padding:14px 46px;font-size:18px;font-weight:800;background:var(--red);
    color:#fff;border:none;border-radius:999px;cursor:pointer;letter-spacing:.15em;
    box-shadow:0 6px 0 #8f2f22,0 10px 24px rgba(0,0,0,.5);transition:transform .08s;}
  #wrap .btn:active{transform:translateY(4px);box-shadow:0 2px 0 #8f2f22;}
  #over{display:none;}
  .final{font-size:min(14vw,80px);font-weight:900;color:#fff;line-height:1;}
  .final small{font-size:16px;color:var(--gold);display:block;letter-spacing:.3em;margin-bottom:6px;}
  @media (prefers-reduced-motion:reduce){#msg.show{animation-duration:.01s;}}
</style>
</head>
<div id="wrap">
  <canvas id="cv" width="800" height="600"></canvas>
  <div id="msg"></div>
  <button id="volBtn" title="音量">🔊</button>
  <button id="fsBtn" title="全画面表示">⛶</button>
  <div id="start">
    <h1>⚾ ナイター・ホームランバトル</h1>
    <div class="sub">
      捕手後方カメラの本格バッティング。<br>
      <b>マウス / 指ドラッグ</b> でミートカーソルを動かし、迫ってくる球に合わせて<br>
      <b>クリック / タップ / スペース</b> でスイング!<br>
      打球は奥へ飛び、<b>野手が追って捕球</b>。抜けばヒット、フェンス越えでホームラン。<br>
      カーソルの<b>下</b>で捉えるとフライ、<b>上</b>を叩くとゴロになる。<br>
      <b>5イニング制</b>: 表はあいての攻撃(0〜4点)、裏はあなたの攻撃。勝利を目指せ!
    </div>
    <button class="btn" id="btnStart">PLAY BALL</button>
  </div>
  <div id="over">
    <h1 id="finalResult"></h1>
    <div class="final"><small>FINAL</small><span id="finalScore">0</span></div>
    <div class="sub" id="finalDetail"></div>
    <button class="btn" id="btnRetry">もう一度</button>
  </div>
</div>
<script src="/blogs/js/baseball.js"></script>
