const accessToken = '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';

// リポジトリの情報を読み込む
fetch(`https://api.github.com/users/Absolute-Value/repos`, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})
  .then(response => response.json())
  .then(data => {
    // 取得したデータから必要な情報を抽出する
    const repos = data.map(repo => {
      return {
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        pushedAt: new Date(repo.pushed_at),
        language: repo.language
      };
    });

  // 言語の色情報を読み込む
  fetch('/assets/colors.json')
    .then(response => response.json())
    .then(data => {
      const colors = data;

    // リポジトリを日付順にソートする
    repos.sort((a, b) => b.pushedAt - a.pushedAt);

    // 最新の3つのリポジトリを取得する
    const latestRepos = repos.slice(0, 8);

      // リポジトリを表示する
    const repoList = document.getElementById('repoList');
    latestRepos.forEach(repo => {
      const repo_div = document.createElement('div');
      repoList.appendChild(repo_div);
      repo_div.className = "repo";

      const repo_a = document.createElement('a');
      repo_a.href = repo.url;
      repo_a.target = "_blank";
      repo_div.appendChild(repo_a);

      const name_p = document.createElement('p');
      repo_a.appendChild(name_p);
      name_p.className = "repo_name";
      const name_b = document.createElement('b');
      name_p.appendChild(name_b);      
      name_b.textContent = repo.name;
      
      const disc_p = document.createElement('p');
      disc_p.className = "repo_disc";
      repo_a.appendChild(disc_p);
      disc_p.appendChild(document.createTextNode(repo.description));
      
      const detail_p = document.createElement('p');
      repo_a.appendChild(detail_p)
      try {
        const col = colors[repo.language].color;
        // FontAwesomeのアイコンを追加する
        const code_icon = document.createElement('i');
        code_icon.className = 'fa fa-circle';
        code_icon.style.color = col;
        detail_p.appendChild(code_icon);
        detail_p.appendChild(document.createTextNode(repo.language));
        detail_p.appendChild(document.createElement('br'));
      } catch(error) {
        true;
      }
      
      // // FontAwesomeのアイコンを追加する
      const calendar_icon = document.createElement('i');
      calendar_icon.className = 'fa fa-calendar';
      detail_p.appendChild(calendar_icon);
      detail_p.appendChild(document.createTextNode(repo.pushedAt.toLocaleDateString()));
    });
  });
})
.catch(error => {
  console.error(error);
});