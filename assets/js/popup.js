function showDetails(button) {
    var popup = document.getElementById("popup");
    popup.innerHTML = "";
    var popupContent = document.createElement('ul');
    popupContent.style.backgroundColor = "var(--entry)";
    popupContent.style.marginTop = "0px";
    popupContent.style.padding = "3%";
    popupContent.style.borderRadius = "20px";

    var skills = document.getElementsByClassName("skill");
    for (i=0;i<skills.length;i++) {
        skills[i].style.backgroundColor = "var(--theme)";
    }

    spanText = button.querySelector("span").innerHTML;
    button.style.backgroundColor = "var(--entry)";
    var language = document.createElement('h2');
    language.innerText = spanText;
    popupContent.appendChild(language)

    switch (spanText) {
        case 'Python':
            popupContent.innerHTML += '<li>最も使用している言語です．<a href="https://github.com/Absolute-Value/Automate-the-boring-stuff-with-python" class="bachelor" target="_blank"><b>繰り返しの作業の自動化</b></a>や<a href="https://github.com/Absolute-Value/python-GUI"  class="other" target="_blank"><b>GUIソフトの制作</b></a>，<a href="https://github.com/Absolute-Value/Cloth-Anomaly-Detection-pytorch" class=labo target="_blank"><b>Deep Learning</b></a>で使用しています．</li>';
            break
        case 'Pytorch':
            popupContent.innerHTML += '<li><a href="https://github.com/Absolute-Value/Cloth-Anomaly-Detection-pytorch" class=labo target="_blank"><b>Deep Learning</b></a>で使用しているライブラリです．Tensorflowと比べて柔軟な実装が可能で最新手法の公開が早いです．Tensorflowもある程度使用できます．</li>';
            break
        case 'Java':
            popupContent.innerHTML += '<li>シューティングゲームを作成しました．</li>';
            popupContent.innerHTML += '<li><img src="/assets/images/FiShooting.png" height="300"/></li>';
            popupContent.innerHTML += '<li>Androidアプリの<a href="https://github.com/gu-info/ToDoCalendar" class="other" target="_blank"><b>TODOリスト付きカレンダー</b></a>も作成しました．</li>';
            break
        case 'Unity':
            popupContent.innerHTML += '<li>VRで蕎麦運びをするゲームとデバイスを作りました．</li>';
            popupContent.innerHTML += '<li><img src="/assets/images/VR.png" height="300"/></li>';
            break
        case 'HTML':
        case 'CSS':
            popupContent.innerHTML += '<li>本ページはjekyllを用いて，既存のテーマに頼らずhtmlとCSSから作成しました．</li>';
            popupContent.innerHTML += '<li>ページの評判が良く，後輩も使うようになりました！採用実績は<a href="https://ia-gu.github.io/index" class="labo" target="_blank"><b>コチラ</b></li>';
            break
        case 'JavaScript':
            popupContent.innerHTML += '<li>本ページにおけるダークモードの実装や下にあるGitHubのリポジトリの取得をしています．</li>';
            break
        case 'Ubuntu':
            popupContent.innerHTML += '<li>GPUノード用のOSです．無料なのに色々できて便利です．</li>';
            popupContent.innerHTML += '<li>最近は<a href="https://github.com/Absolute-Value/gpu-setup-20.04" class="other" target="_blank"><b>セットアップ</b></a>や修理をしています．</li>';
            break
        case 'Docker':
            popupContent.innerHTML += '<li>GPUノードの個別の環境構築に使用しています．</li>';
            popupContent.innerHTML += '<li>これまでよくわからず使っていましたが，最近はお友達になりました．リポジトリはセキュリティの都合上，非公開です．</li>';
            break
        default:
            popupContent.innerHTML += spanText;
    }

    popup.appendChild(popupContent);
}