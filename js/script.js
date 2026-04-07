/* ================= CAROUSEL ================= */

const items = document.querySelectorAll(".carousel-item");
const btnNext = document.querySelector(".carousel-btn.right");
const btnPrev = document.querySelector(".carousel-btn.left");

let current = 0;
let interval;

/* MOSTRAR SLIDE */
function showSlide(index) {
  items.forEach(item => item.classList.remove("active"));
  items[index].classList.add("active");
}

/* PRÓXIMO */
function nextSlide() {
  current = (current + 1) % items.length;
  showSlide(current);
}

/* ANTERIOR */
function prevSlide() {
  current = (current - 1 + items.length) % items.length;
  showSlide(current);
}

/* AUTOPLAY */
function startAutoPlay() {
  interval = setInterval(nextSlide, 5000); // troca a cada 5s
}

function stopAutoPlay() {
  clearInterval(interval);
}

/* BOTÕES */
btnNext.addEventListener("click", () => {
  nextSlide();
  restartAutoPlay();
});

btnPrev.addEventListener("click", () => {
  prevSlide();
  restartAutoPlay();
});

/* PAUSA AO PASSAR O MOUSE (UX top) */
const carousel = document.querySelector(".carousel");

carousel.addEventListener("mouseenter", stopAutoPlay);
carousel.addEventListener("mouseleave", startAutoPlay);

/* RESTART */
function restartAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

/* INIT */
startAutoPlay();


/* ================= CARDS ================= */

const cards = document.querySelectorAll(".card");

cards.forEach(card => {
  const link = card.dataset.link;

  /* CLICK */
  card.addEventListener("click", () => {
    if (link) window.location.href = link;
  });

  /* TECLADO */
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (link) window.location.href = link;
    }
  });

  /* ACESSIBILIDADE */
  card.setAttribute("tabindex", "0");
});


/* ================= MELHORIAS UX ================= */

/* Impede clique ao arrastar */
let isClickPrevented = false;

track.addEventListener("mousedown", () => {
  isClickPrevented = false;
});

track.addEventListener("mousemove", () => {
  if (isDragging) isClickPrevented = true;
});


/* Cursor dinâmico */
track.addEventListener("mousedown", () => {
  track.style.cursor = "grabbing";
});

track.addEventListener("mouseup", () => {
  track.style.cursor = "grab";
});

track.addEventListener("mouseleave", () => {
  track.style.cursor = "grab";
});

/* ================= ANIMAÇÃO DE ENTRADA ================= */

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target); // IMPORTANTE (melhora performance)
    }
  });
}, {
  threshold: 0.2
});

document.querySelectorAll(".card:nth-child(-n+6), .info-block").forEach(el => {
  el.classList.add("hidden");
  observer.observe(el);
});