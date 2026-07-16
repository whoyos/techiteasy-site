/* ============================
   GLOBAL SITE JAVASCRIPT
   ============================ */

/* Mobile Navigation Toggle (optional future use) */
function toggleMenu() {
  const nav = document.querySelector("nav");
  nav.classList.toggle("open");
}

/* Smooth Scroll for internal links */
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("a[href^='#']");
  links.forEach(link => {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});

/* Highlight Active Navigation Link */
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});