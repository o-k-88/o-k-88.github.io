const scrollTopBtn = document.querySelector("#scrollTop");

function scrollTop() {
  window.scrollTo(0, 0);
}
scrollTopBtn.addEventListener("click", scrollTop);

function checkHeight() {
  if (window.scrollY > 50) {
    scrollTopBtn.classList.remove("visually-hidden");
  } else {
    scrollTopBtn.classList.add("visually-hidden");
  }
}

window.addEventListener("scroll", checkHeight);
