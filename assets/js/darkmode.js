let isDarkMode = false;

if (window.matchMedia){
  if (window.matchMedia('(prefers-color-scheme: dark)').matches){
    isDarkMode = true;
  }

  //ローカルストレージ判定
  if(localStorage.getItem('dark-mode-settings')==='dark') {
    isDarkMode = true;
  } else if (localStorage.getItem('dark-mode-settings')==='light') {
    isDarkMode = false;
  }

  change(isDarkMode);
}
 
function darkButton() {
  if (isDarkMode) {
    isDarkMode = false;
  } else {
    isDarkMode = true;
  }
  change(isDarkMode);
}

function change(mode) {
  if (mode) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    localStorage.setItem('dark-mode-settings', 'dark');

    let element = document.getElementById('sun_moon');
    if ("fa fa-moon-o" == element.className){
      element.classList.replace("fa-moon-o", "fa-sun-o");
    }
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    localStorage.setItem('dark-mode-settings', 'light');

    let element = document.getElementById('sun_moon');
    if ("fa fa-sun-o" == element.className){
      element.classList.replace("fa-sun-o", "fa-moon-o");
    }
  }
}