---
title: 野球ゲーム
date: "2023-06-07 00:00:00"
update: "2026-07-12 17:30:00"
category: "Blog"
hero: https://cdn.pixabay.com/photo/2016/11/22/22/17/action-1850887_1280.jpg
tags: ["JavaScript"]
layout: blog
excerpt: '<span style="color: #42b983;">[遊べます！] </span>3D野球ゲーム'
---

学生の特権を使ってGithub PROアカウントになり，Github Copilotを試してたら楽しくなって作ってしまった<a href="https://github.com/Absolute-Value/BaseBallGame" target="_blank"><b>コチラ</b></a>の野球ゲームのpythonコードをJavaScriptに移行してみました．
Claude Fable 5を使って3Dゲームにしました．  
ゲーム画面が表示されない場合はReloadしてみてください．

<a href="https://github.com/Absolute-Value/BaseBallJS" target="_blank"><b>Github リポジトリ</b></a>

<head>
<style>
  :root{--night:#0d1b2e;--gold:#f2b632;--red:#d94f3d;--blue:#7ec8ff;--ink:#e8e4d8;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
  html,body{height:100%;overflow:hidden;background:var(--night);
    font-family:"Hiragino Kaku Gothic ProN","Yu Gothic",system-ui,sans-serif;user-select:none;}
  /* 基本: ページの横幅いっぱいに表示(埋め込み向け) */
  #wrap{position:relative;width:100%;display:flex;align-items:center;justify-content:center;}
  canvas{display:block;width:100%;height:auto;cursor:none;box-shadow:0 0 80px rgba(0,0,0,.6);touch-action:none;}
  /* 全画面時(Fullscreen API / 疑似フルスクリーン共通) */
  #wrap:fullscreen,#wrap.fakefull{position:fixed;inset:0;width:100vw;height:100vh;background:var(--night);z-index:999;}
  #wrap:fullscreen canvas,#wrap.fakefull canvas{width:auto;height:auto;max-width:100vw;max-height:100vh;}
  #fsBtn{position:absolute;right:12px;bottom:12px;z-index:8;
    width:44px;height:44px;border-radius:10px;border:1px solid rgba(242,182,50,.5);
    background:rgba(6,12,22,.8);color:var(--gold);font-size:20px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;transition:background .15s;}
  #fsBtn:hover{background:rgba(20,32,52,.9);}
  #hud{position:absolute;top:10px;left:50%;transform:translateX(-50%);
    display:flex;gap:16px;align-items:center;background:rgba(6,12,22,.85);
    border:1px solid rgba(242,182,50,.4);border-radius:10px;padding:7px 18px;
    color:var(--ink);font-variant-numeric:tabular-nums;pointer-events:none;z-index:5;}
  #hud .lbl{font-size:9px;letter-spacing:.16em;color:#9db2c8;}
  #hud .val{font-size:20px;font-weight:800;color:var(--gold);line-height:1.1;}
  #hud .box{text-align:center;}
  .dots{display:flex;gap:4px;margin-top:4px;justify-content:center;}
  .d{width:8px;height:8px;border-radius:50%;border:1px solid #9db2c8;}
  .d.b.on{background:#4caf50;border-color:#4caf50;}
  .d.s.on{background:var(--gold);border-color:var(--gold);}
  .d.o.on{background:var(--red);border-color:var(--red);}
  #bases{position:relative;width:34px;height:34px;margin-top:1px;}
  #bases i{position:absolute;width:11px;height:11px;background:#2c3c54;border:1px solid #56708f;transform:rotate(45deg);}
  #bases .b2{top:0;left:11px;} #bases .b3{top:11px;left:0;} #bases .b1{top:11px;left:22px;}
  #bases i.on{background:var(--gold);border-color:var(--gold);box-shadow:0 0 6px var(--gold);}
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
  .btn{margin-top:8px;padding:14px 46px;font-size:18px;font-weight:800;background:var(--red);
    color:#fff;border:none;border-radius:999px;cursor:pointer;letter-spacing:.15em;
    box-shadow:0 6px 0 #8f2f22,0 10px 24px rgba(0,0,0,.5);transition:transform .08s;}
  .btn:active{transform:translateY(4px);box-shadow:0 2px 0 #8f2f22;}
  #over{display:none;}
  .final{font-size:min(14vw,80px);font-weight:900;color:#fff;line-height:1;}
  .final small{font-size:16px;color:var(--gold);display:block;letter-spacing:.3em;margin-bottom:6px;}
  @media (prefers-reduced-motion:reduce){#msg.show{animation-duration:.01s;}}
</style>
</head>
<div id="wrap">
    <canvas id="cv" width="800" height="600"></canvas>
    <div id="hud">
        <div class="box"><div class="lbl">得点</div><div class="val" id="hScore">0</div></div>
        <div class="box"><div class="lbl">HR</div><div class="val" id="hHR" style="color:var(--red)">0</div></div>
        <div class="box"><div class="lbl">安打</div><div class="val" id="hHits" style="color:var(--blue)">0</div></div>
        <div class="box"><div class="lbl">B</div><div class="dots" id="hBalls"><span class="d b"></span><span class="d b"></span><span class="d b"></span></div></div>
        <div class="box"><div class="lbl">S</div><div class="dots" id="hStrikes"><span class="d s"></span><span class="d s"></span></div></div>
        <div class="box"><div class="lbl">O</div><div class="dots" id="hOuts"><span class="d o"></span><span class="d o"></span><span class="d o"></span></div></div>
        <div class="box"><div class="lbl">塁</div><div id="bases"><i class="b1"></i><i class="b2"></i><i class="b3"></i></div></div>
    </div>
    <div id="msg"></div>
    <button id="fsBtn" title="全画面表示">⛶</button>
    <div id="start">
        <h1>⚾ ナイター・ホームランバトル</h1>
        <div class="sub">
            捕手後方カメラの本格バッティング。<br>
            <b>マウス / 指ドラッグ</b> でミートカーソルを動かし、迫ってくる球に合わせて<br>
            <b>クリック / タップ / スペース</b> でスイング!<br>
            打球は奥へ飛び、<b>野手が追って捕球</b>。抜けばヒット、フェンス越えでホームラン。<br>
            カーソルの<b>下</b>で捉えるとフライ、<b>上</b>を叩くとゴロになる。
        </div>
        <button class="btn" id="btnStart">PLAY BALL</button>
    </div>
    <div id="over">
        <div class="final"><small>FINAL</small><span id="finalScore">0</span><small style="letter-spacing:.1em;margin-top:4px;">得点</small></div>
        <div class="sub" id="finalDetail"></div>
        <button class="btn" id="btnRetry">もう一度</button>
    </div>
</div>
<script src="/blogs/js/baseball.js"></script>
