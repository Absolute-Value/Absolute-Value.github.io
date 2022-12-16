let dark_mode = false;

if (window.matchMedia){
  if (window.matchMedia('(prefers-color-scheme: dark)').matches){
    dark_mode = true;
  }
  change(dark_mode);
}
 
function dark_btn() {
  if (dark_mode) {
    dark_mode = false;
  } else {
    dark_mode = true;
  }
  change(dark_mode);
}

function change(mode) {
  if (mode) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
  }
}