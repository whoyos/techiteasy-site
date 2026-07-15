// Theme toggle and year script
(function(){
  const themeToggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');

  // Set year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Load saved theme
  const saved = localStorage.getItem('site-theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle && themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle && themeToggle.setAttribute('aria-pressed', 'false');
  }

  // Toggle handler
  themeToggle && themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('site-theme');
      themeToggle.setAttribute('aria-pressed', 'false');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('site-theme', 'dark');
      themeToggle.setAttribute('aria-pressed', 'true');
    }
  });
})();
