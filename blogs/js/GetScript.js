const BASE_URL = 'https://absolute-value.github.io/BaseBallJS/'
const HTML_URL = 'index.html'

// ファイルからスクリプトタグを取得する関数
function getScriptsFromFile(url) {
    // ファイルを読み込みます。
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.onload = function() {
        if (xhr.status === 200) {
            // ファイルの内容を取得します。
            var content = xhr.responseText;
            // スクリプトタグを取得します。
            var scripts = content.match(/<script[^>]+>.*?<\/script>/g);
            // スクリプトタグをHTMLに追加します。
            for (var i = 0; i < scripts.length; i++) {
                // 取得したスクリプトタグからsrc属性の値のみを取得します。
                var src = scripts[i].match(/src=".*?"/)[0].replace(/src=|"/g, "");
                // srcが js/ から始まる場合は、前にBASE_URLを付けます。
                if (src.indexOf("js/") === 0) {
                    src = BASE_URL + src;
                }
                // スクリプトタグをHTMLに追加します。
                document.body.appendChild(document.createElement("script")).src = src;
            }
        } else {
            console.log("Error loading file: " + xhr.status);
        }
    };
    xhr.send();
  }
  
  // リンクからファイルを取得し、スクリプトタグをHTMLに追加する
  getScriptsFromFile(BASE_URL+HTML_URL);