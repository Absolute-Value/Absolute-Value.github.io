// リポジトリの情報を読み込む（公開リポジトリのみ）
fetch(`https://api.github.com/users/Absolute-Value/repos?per_page=8&sort=pushed`)
  .then(response => response.json())
  .then(repos => {
    repos = repos.map(repo => ({
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      pushedAt: new Date(repo.pushed_at),
      language: repo.language
    }));

    // 言語の色情報(json)を読み込む
    fetch('/assets/colors.json')
      .then(response => response.json())
      .then(colors => {
        const repoList = document.getElementById('repoList');
        repos.forEach(repo => {
          const repo_div = document.createElement('div');
          repo_div.className = "repo";
          repoList.appendChild(repo_div);

          const repo_a = document.createElement('a');
          repo_a.href = repo.url;
          repo_a.target = "_blank";
          repo_div.appendChild(repo_a);

          const name_p = document.createElement('p');
          name_p.className = "repo_name";
          repo_a.appendChild(name_p);

          const name_b = document.createElement('b');
          name_b.textContent = repo.name;
          name_p.appendChild(name_b);

          const disc_p = document.createElement('p');
          disc_p.className = "repo_disc";
          disc_p.textContent = repo.description || "";
          repo_a.appendChild(disc_p);

          const detailElementP = document.createElement('p');
          repo_a.appendChild(detailElementP);

          // 言語のバッジと最終コミットバッジ
          const langColor = (colors[repo.language] && colors[repo.language].color) ? colors[repo.language].color.replace('#', '') : 'gray';
          const langLogo = repo.language ? repo.language.replace(' Notebook', '').replace('HTML', 'HTML5') : '';

          // 言語バッジ
          if (repo.language) {
            const code = document.createElement('img');
            code.src = `https://img.shields.io/github/languages/top/Absolute-Value/${repo.name}?color=${langColor}&logo=${langLogo}&logoColor=${langColor}&style=flat`;
            detailElementP.appendChild(code);
            detailElementP.appendChild(document.createElement('br'));
          }

          // 最終コミットバッジ
          const calendar = document.createElement('img');
          calendar.src = `https://img.shields.io/github/last-commit/Absolute-Value/${repo.name}?logoColor=white&logo=GitHub%20Actions`;
          detailElementP.appendChild(calendar);
        });
      });
  })
  .catch(error => {
    console.error(error);
  });