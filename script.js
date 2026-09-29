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

/* Browser-language suggestion and Google Translate handoff */
document.addEventListener("DOMContentLoaded", () => {
    if (location.hostname.endsWith(".translate.goog")) {
        const originalPage = new URL(location.pathname, "https://techiteasy.cc");
        new URLSearchParams(location.search).forEach((value, name) => {
            if (!name.startsWith("_x_tr_")) {
                originalPage.searchParams.append(name, value);
            }
        });
        originalPage.hash = location.hash;

        const notice = document.createElement("aside");
        notice.className = "translation-form-notice";
        notice.setAttribute("role", "alert");

        const message = document.createElement("p");
        message.textContent = "Google Translate blocks form submissions. Continue on the original site to use forms.";

        const originalLink = document.createElement("a");
        originalLink.href = originalPage.toString();
        originalLink.target = "_blank";
        originalLink.rel = "noopener noreferrer";
        originalLink.textContent = "Continue on the original site";

        let serviceSelect = null;

        function updateOriginalLink() {
            if (serviceSelect?.value) {
                originalPage.searchParams.set("service", serviceSelect.value);
            } else {
                originalPage.searchParams.delete("service");
            }
            originalLink.href = originalPage.toString();
        }

        function continueOnOriginalSite() {
            if (serviceSelect && !serviceSelect.value) {
                serviceSelect.focus();
                return;
            }
            updateOriginalLink();
            window.location.assign(originalLink.href);
        }

        document.querySelectorAll("form").forEach(form => {
            const formServiceSelect = form.querySelector("#service");
            if (formServiceSelect) {
                serviceSelect = formServiceSelect;
                form.noValidate = true;
                form.querySelectorAll("input, textarea, label").forEach(field => {
                    if (field.matches('label[for="service"]')) {
                        return;
                    }
                    field.hidden = true;
                    field.required = false;
                });
                serviceSelect.addEventListener("change", updateOriginalLink);
                message.textContent = "Google Translate blocks form submissions. Choose a service, then continue on the original site to finish booking.";
            } else {
                form.classList.add("translation-form-readonly");
                form.querySelectorAll("input, textarea, select").forEach(field => {
                    field.disabled = true;
                });
            }

            form.querySelectorAll('button[type="submit"], input[type="submit"]').forEach(submitControl => {
                const continueButton = document.createElement("button");
                continueButton.type = "button";
                continueButton.className = submitControl.className;
                continueButton.textContent = "Continue on the original site";
                continueButton.addEventListener("click", continueOnOriginalSite);
                submitControl.replaceWith(continueButton);
            });

            form.addEventListener("submit", event => {
                event.preventDefault();
                event.stopImmediatePropagation();
                continueOnOriginalSite();
            }, true);
            updateOriginalLink();
        });

        originalLink.addEventListener("click", () => updateOriginalLink());
        notice.append(message, originalLink);
        document.body.prepend(notice);
        return;
    }

    const isLocalPreview = location.protocol === "file:" || ["localhost", "127.0.0.1", "::1", "[::1]"].includes(location.hostname);

    const languageCodes = `af sq am ar hy as ay az bm eu be bn bho bs bg ca ceb ny zh-CN zh-TW co hr cs da dv doi nl eo et ee tl fi fr fy gl ka de el gn gu ht ha haw iw hi hmn hu is ig ilo id ga it ja jv kn kk km rw gom ko kri ku ky lo la lv ln lt lg lb mk mai mg ms ml mt mi mr lus mn my ne nso no or om ps fa pl pt pa qu ro ru sm sa gd sr st sn sd si sk sl so es su sw sv tg ta tt te th ti ts tr tk ak uk ur ug uz vi cy xh yi yo zu`.split(" ");
    const supportedLanguages = new Set(languageCodes);
    const browserLocale = navigator.languages?.[0] || navigator.language || "en";
    const suggestedLanguage = getGoogleLanguage(browserLocale);
    const languageNames = typeof Intl.DisplayNames === "function"
        ? new Intl.DisplayNames([browserLocale], { type: "language" })
        : null;
    const wrapper = document.createElement("div");
    wrapper.className = "language-switcher";

    const toggle = document.createElement("button");
    toggle.className = "language-switcher__toggle";
    toggle.type = "button";
    toggle.textContent = "Translate";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "language-switcher-panel");

    const panel = document.createElement("section");
    panel.className = "language-switcher__panel";
    panel.id = "language-switcher-panel";
    panel.hidden = true;
    panel.setAttribute("aria-label", "Translation options");

    const heading = document.createElement("h2");
    heading.className = "language-switcher__heading";
    heading.textContent = suggestedLanguage && suggestedLanguage !== "en"
        ? `Read this page in ${getLanguageName(suggestedLanguage)}?`
        : "Choose a page language";

    const description = document.createElement("p");
    description.className = "language-switcher__description";
    description.textContent = isLocalPreview
        ? "Google cannot reach a local preview. Deploy the site publicly to test translation."
        : "Google Translate opens this page in a new tab and processes its URL and content.";

    const label = document.createElement("label");
    label.className = "language-switcher__label";
    label.htmlFor = "language-switcher-select";
    label.textContent = "Translate to";

    const select = document.createElement("select");
    select.className = "language-switcher__select";
    select.id = "language-switcher-select";
    languageCodes
        .filter(code => code !== "en")
        .map(code => ({ code, name: getLanguageName(code) }))
        .sort((first, second) => first.name.localeCompare(second.name, browserLocale))
        .forEach(({ code, name }) => {
            const option = document.createElement("option");
            option.value = code;
            option.textContent = name;
            select.append(option);
        });

    if (suggestedLanguage && supportedLanguages.has(suggestedLanguage)) {
        select.value = suggestedLanguage;
    }

    const actions = document.createElement("div");
    actions.className = "language-switcher__actions";

    const translateLink = document.createElement(isLocalPreview ? "span" : "a");
    translateLink.className = "language-switcher__action";
    translateLink.textContent = isLocalPreview ? "Available after deployment" : "Translate with Google";
    if (isLocalPreview) {
        translateLink.classList.add("language-switcher__action--disabled");
    } else {
        translateLink.target = "_blank";
        translateLink.rel = "noopener noreferrer";
    }

    const closeButton = document.createElement("button");
    closeButton.className = "language-switcher__dismiss";
    closeButton.type = "button";
    closeButton.textContent = "Continue in English";

    function getLanguageName(code) {
        return languageNames?.of(code) || code.toUpperCase();
    }

    function getGoogleLanguage(locale) {
        const normalized = locale.replaceAll("_", "-").toLowerCase();
        const parts = normalized.split("-");
        const base = parts[0];

        if (base === "zh") {
            return parts.includes("tw") || parts.includes("hk") || parts.includes("mo") || parts.includes("hant")
                ? "zh-TW"
                : "zh-CN";
        }

        const aliases = { fil: "tl", he: "iw" };
        return aliases[base] || base;
    }

    function updateTranslateLink() {
        const translateUrl = new URL("https://translate.google.com/translate");
        translateUrl.searchParams.set("sl", document.documentElement.lang || "en");
        translateUrl.searchParams.set("tl", select.value);
        translateUrl.searchParams.set("u", window.location.href);
        translateLink.href = translateUrl.toString();
    }

    function setPanelOpen(isOpen) {
        panel.hidden = !isOpen;
        toggle.setAttribute("aria-expanded", String(isOpen));
    }

    if (!isLocalPreview) {
        select.addEventListener("change", updateTranslateLink);
    }
    toggle.addEventListener("click", () => setPanelOpen(panel.hidden));
    closeButton.addEventListener("click", () => {
        setPanelOpen(false);
        try {
            sessionStorage.setItem("language-suggestion-dismissed", "true");
        } catch {
            // The prompt can still be dismissed for this page if storage is unavailable.
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) {
            setPanelOpen(false);
            toggle.focus();
        }
    });

    if (!isLocalPreview) {
        updateTranslateLink();
    }
    actions.append(translateLink, closeButton);
    panel.append(heading, description, label, select, actions);
    wrapper.append(panel, toggle);
    document.body.append(wrapper);

    let suggestionDismissed = false;
    try {
        suggestionDismissed = sessionStorage.getItem("language-suggestion-dismissed") === "true";
    } catch {
        suggestionDismissed = false;
    }

    if (suggestedLanguage && suggestedLanguage !== "en" && supportedLanguages.has(suggestedLanguage) && !suggestionDismissed) {
        setPanelOpen(true);
    }
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
