function showDetails(button) {
    var popup = document.createElement("div");
    popup.classList.add("popup");

    var closeButton = document.createElement("div");
    closeButton.classList.add("close");
    closeButton.innerHTML = "x";
    closeButton.addEventListener("click", closePopup);

    var popupContent = document.createElement("div");
    popupContent.classList.add("popup-content");
    spanText = button.querySelector("span").innerHTML;
    switch (spanText) {
        case 'Python':
            popupContent.innerHTML = '<li>最も使用している言語です．<a href="https://github.com/Absolute-Value/Automate-the-boring-stuff-with-python" class="bachelor" target="_blank"><b>繰り返しの作業の自動化</b></a>や<a href="https://github.com/Absolute-Value/python-GUI"  class="other" target="_blank"><b>GUIソフトの制作</b></a>，<a href="https://github.com/Absolute-Value/Cloth-Anomaly-Detection-pytorch" class=labo target="_blank"><b>Deep Learning</b></a>で使用しています．</li>';
            break
        case 'Pytorch':
            popupContent.innerHTML = '<li><a href="https://github.com/Absolute-Value/Cloth-Anomaly-Detection-pytorch" class=labo target="_blank"><b>Deep Learning</b></a>で使用しているライブラリです．Tensorflowと比べて柔軟な実装が可能で最新手法の公開が早いです．Tensorflowもある程度使用できます．</li>';
            break
        case 'Java':
            popupContent.innerHTML = '<li>シューティングゲームを作成しました．</li>';
            popupContent.innerHTML += '<li><img src="/assets/images/FiShooting.png" height="300"/></li>';
            popupContent.innerHTML += '<li>Androidアプリの<a href="https://github.com/gu-info/ToDoCalendar" class="other" target="_blank"><b>TODOリスト付きカレンダー</b></a>も作成しました．</li>';
            break
        case 'Unity':
            popupContent.innerHTML = '<li>VRで蕎麦運びをするゲームとデバイスを作りました．</li>';
            popupContent.innerHTML += '<li><img src="/assets/images/VR.png" height="300"/></li>';
            break
        case 'HTML':
        case 'CSS':
        case 'JavaScript':
            popupContent.innerHTML = '<li>本ページはjekyllを用いて，既存のテーマに頼らずhtmlとCSSから作成しました．</li>';
            popupContent.innerHTML += '<li>最近では，ダークモードや下にあるGitHubのリポジトリの取得をJavaScriptを用いて作成しました．</li>';
            popupContent.innerHTML += '<li>ページの評判が良く，後輩も使うようになりました！採用実績は<a href="https://ia-gu.github.io/index" class="labo" target="_blank"><b>コチラ</b></li>';
            break
        case 'Ubuntu':
            popupContent.innerHTML = '<li>GPUノード用のOSです．無料なのに色々できて便利です．</li>';
            popupContent.innerHTML += '<li>最近は<a href="https://github.com/Absolute-Value/gpu-setup-20.04" class="other" target="_blank"><b>セットアップ</b></a>や修理をしています．</li>';
        case 'Docker':
            popupContent.innerHTML = '<li>GPUノードの個別の環境構築に使用しています．</li>';
            popupContent.innerHTML += '<li>これまでよくわからず使っていましたが，最近はお友達になりました．リポジトリはセキュリティの都合上，非公開です．</li>';
            break
        default:
            popupContent.innerHTML = spanText;
    }

    popup.appendChild(closeButton)
    popup.appendChild(popupContent);
    document.body.appendChild(popup);
}

function closePopup() {
    var popup = document.querySelector(".popup");
    popup.parentNode.removeChild(popup);
}