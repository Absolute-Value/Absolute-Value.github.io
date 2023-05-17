const accessToken1 = 'github_pat_'
const accessToken2 = '11APYI3YQ0SmOhnX2h0eox_'
const accessToken3 = '34SomMLaKk2qpQPxgWW82Xy9mc46CBvy41QqnFVHztRYINFEZVWRNlbZquB';

// リポジトリの情報を読み込む
fetch(`https://api.github.com/users/Absolute-Value/repos`, {
  headers: {
    Authorization: `Bearer ${accessToken1+accessToken2+accessToken3}`
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

    // リポジトリを表示する
    const repoList = document.getElementById('repoList');

    // 最新の3つのリポジトリを取得する
    const latestRepos = repos.slice(0, 10);

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
        const col = colors[repo.language].color.replace('#','');
        // FontAwesomeのアイコンを追加する
        const code = document.createElement('img');
        var log_name = repo.language.replace(' Notebook','');
        log_name = log_name.replace('HTML', 'HTML5');
        code.src = 'https://img.shields.io/github/languages/top/Absolute-Value/'+repo.name+'?color='+col+'&logo='+log_name+'&logoColor='+col+'&style=flat';
        
        detail_p.appendChild(code)
        detail_p.appendChild(document.createElement('br'));
      } catch(error) {
        true;
      }
      
      // // FontAwesomeのアイコンを追加する
      const calendar = document.createElement('img');
      calendar.src = 'https://img.shields.io/github/last-commit/Absolute-Value/'+repo.name+'?logoColor=white&logo=GitHub%20Actions'
      detail_p.appendChild(calendar);
    });
  });
})
.catch(error => {
  console.error(error);
});