const swiper = new Swiper(".project-swiper", {
  // Optional parameters

  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    // when window width is >= 360px
    360: {
      slidesPerView: 1.5,
      spaceBetween: 20,
    },
    768: {
      slidesPerView: 2.5,
      spaceBetween: 20,
    },

    // when window width is >= 1024px
    1024: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
  },
});

// Scroll top button
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
