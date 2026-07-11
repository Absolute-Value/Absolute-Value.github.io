---
title: 野球ゲーム
date: "2023-06-07 00:00:00"
update: "2023-06-07 01:00:00"
category: "Blog"
hero: https://cdn.pixabay.com/photo/2016/11/22/22/17/action-1850887_1280.jpg
tags: ["JavaScript"]
layout: blog
excerpt: '<span style="color: #42b983;">[遊べます！] </span>Pythonで作った野球ゲームをJavaScriptに移植しました．'
---

学生の特権を使ってGithub PROアカウントになり，Github Copilotを試してたら楽しくなって作ってしまった<a href="https://github.com/Absolute-Value/BaseBallGame" target="_blank"><b>コチラ</b></a>の野球ゲームのpythonコードをJavaScriptに移行してみました．それをさらに、Claudeを使って改善しました．  
このまま遊べると思います．操作方法はゲームの下にあります．
ゲーム画面が表示されない場合はReloadしてみてください．

<a href="https://github.com/Absolute-Value/BaseBallJS" target="_blank"><b>Github リポジトリ</b></a>

<head>
  <meta charset="utf-8">
    <style>
      #GameCanvas {
        margin: 1% 5%;
      }
    </style>
</head>

<script src="/blogs/js/GetScript.js"></script>

<div id="GameCanvas"></div>

## 操作方法 | Controls

<table>
  <tr>
    <th>キー</th>
    <th>説明</th>
  </tr>
  <tr>
    <td>w / up</td>
    <td>上へ移動</td>
  </tr>
  <tr>
    <td>s / down</td>
    <td>下へ移動</td>
  </tr>
  <tr>
    <td>a / left</td>
    <td>左へ移動</td>
  </tr>
  <tr>
    <td>d / right</td>
    <td>右へ移動</td>
  </tr>
  <tr>
    <td>N（投球を受けている間）</td>
    <td>長押しでスイング、途中で離すことでバント</td>
  </tr>
  <tr>
    <td>d / right</td>
    <td>一塁の走者を選択</td>
  </tr>
  <tr>
    <td>w / up</td>
    <td>二塁の走者を選択</td>
  </tr>
  <tr>
    <td>a / left</td>
    <td>三塁の走者を選択</td>
  </tr>
  <tr>
    <td>s / down</td>
    <td>すべての走者を選択（打者が一塁へ走っている最中を除く）</td>
  </tr>
  <tr>
    <td>選択キー + M</td>
    <td>選択した走者を1つ先の塁へ進める</td>
  </tr>
  <tr>
    <td>選択キー + N</td>
    <td>選択した走者を、進塁を始めた塁まで戻す（それより後ろには戻らない）</td>
  </tr>
</table>