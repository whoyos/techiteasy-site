/* ============================ GLOBAL SITE JAVASCRIPT ============================ */

/* Mobile Navigation Toggle (optional future use) */
function toggleMenu() {
    const nav = document.querySelector("nav");
    if (nav) {
        nav.classList.toggle("open");
    }
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
    // Get the current filename (e.g., "services.html")
    let currentPage = window.location.pathname.split("/").pop();
    
    // If the path is empty (like a root domain landing page), default to index.html
    if (currentPage === "") {
        currentPage = "index.html";
    }

    const navLinks = document.querySelectorAll("nav a");
    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
});
