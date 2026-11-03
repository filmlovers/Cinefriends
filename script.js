document.addEventListener("DOMContentLoaded", () => {
  const first = films[0];
  document.getElementById("featured-title").textContent = first.title;
  document.getElementById("featured-poster-title").innerHTML = first.posterTitle;
  document.getElementById("featured-genre").textContent = first.genre.toUpperCase();
  document.getElementById("featured-description").textContent = first.description;
  document.getElementById("featured-date").textContent = first.date;
  document.getElementById("featured-time").textContent = first.time;
  document.getElementById("featured-venue").textContent = first.venue;
  document.getElementById("featured-address").textContent = first.address;
  const featuredPoster = document.getElementById("featured-poster");
  featuredPoster.classList.add("poster-" + first.color);
  if (first.poster) {
    const img = new Image();
    img.className = "poster-img";
    img.alt = "Locandina di " + first.title;
    img.onload = () => {
      featuredPoster.prepend(img);
      featuredPoster.classList.add("poster-has-image");
    };
    img.src = first.poster; // se l'immagine non si carica resta la locandina tipografica
  }

  const list = document.getElementById("schedule-list");
  const select = document.getElementById("film");
  films.forEach((film, i) => {
    const option = document.createElement("option");
    option.value = `${film.title} — ${film.date}`;
    option.textContent = `${film.title} · ${film.date}`;
    select.appendChild(option);
    const row = document.createElement("article");
    row.className = "schedule-item";
    row.innerHTML = `<span class="schedule-number">${String(i + 1).padStart(2, "0")}</span>
      <div class="schedule-thumb poster-${film.color}">${film.poster ? `<img src="${film.poster}" alt="Locandina di ${film.title}" loading="lazy" onerror="this.remove()">` : ""}</div>
      <div class="schedule-date">${film.date}<small>${film.time}</small></div>
      <div class="schedule-film"><h3>${film.title}</h3><span>${film.genre}</span></div>
      <div class="schedule-place">${film.venue}<small>${film.address}</small></div>
      <a class="schedule-book" href="#prenota" aria-label="Prenota ${film.title}">↗</a>`;
    list.appendChild(row);
  });
  loadGiscus();
  setupBookingForm();
  document.getElementById("year").textContent = new Date().getFullYear();
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("nav-open")));
});

// Sezione "Proposte": carica Giscus solo se giscus-config.js è stato compilato.
function loadGiscus() {
  const cfg = window.GISCUS_CONFIG || {};
  const container = document.getElementById("giscus-container");
  const fallback = document.getElementById("giscus-fallback");
  if (!container) return;
  if (!cfg.repo || !cfg.repoId || !cfg.categoryId) {
    if (fallback) fallback.hidden = false;
    console.info("Giscus non configurato: compila giscus-config.js (vedi README).");
    return;
  }
  const s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  s.async = true;
  s.crossOrigin = "anonymous";
  const attrs = {
    repo: cfg.repo, "repo-id": cfg.repoId,
    category: cfg.category || "Proposte", "category-id": cfg.categoryId,
    mapping: "specific", term: cfg.term || "Proposte Cinefriends",
    strict: "0", "reactions-enabled": "1", "emit-metadata": "0",
    "input-position": "top", theme: cfg.theme || "light", lang: "it", loading: "lazy"
  };
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute("data-" + k, v));
  container.appendChild(s);
}


// Prenotazioni: invio con Web3Forms (https://web3forms.com)
function setupBookingForm() {
  const form = document.getElementById("booking-form");
  const status = document.getElementById("form-status");
  if (!form) return;
  const cfg = window.BOOKING_CONFIG || {};
  const button = form.querySelector(".submit-button");

  const show = (html, type) => {
    status.innerHTML = html;
    status.className = "form-status form-status-" + type;
    status.hidden = false;
  };
  const mailtoLink = () => {
    if (!cfg.fallbackEmail) return "";
    const lines = [];
    new FormData(form).forEach((v, k) => {
      if (["access_key", "subject", "from_name", "botcheck"].includes(k) || !v) return;
      lines.push(k + ": " + v);
    });
    return "mailto:" + encodeURIComponent(cfg.fallbackEmail).replace("%40", "@") +
      "?subject=" + encodeURIComponent("Nuova prenotazione Cinefriends") +
      "&body=" + encodeURIComponent(lines.join("\n"));
  };
  const fail = (msg) => {
    const link = mailtoLink();
    show(msg + (link ? ` <a href="${link}">Invia la prenotazione via email ↗</a>` : ""), "error");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.hidden = true;
    if (!cfg.accessKey) {
      fail("Le prenotazioni online non sono ancora attive.");
      console.info("Web3Forms non configurato: compila prenotazioni-config.js (vedi README).");
      return;
    }
    form.elements["access_key"].value = cfg.accessKey;
    const label = button.innerHTML;
    button.disabled = true;
    button.textContent = "Invio in corso…";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        // Prenotazione registrata: la conferma via email è un extra e non blocca mai il flusso.
        const sent = await sendConfirmationEmail(form);
        try { sessionStorage.setItem("cf_conferma", sent ? "1" : ""); } catch (e) {}
        window.location.href = "grazie.html";
        return;
      }
      fail("Non siamo riusciti a inviare la prenotazione" + (data.message ? " (" + data.message + ")" : "") + ".");
    } catch (err) {
      fail("Connessione non riuscita: riprova tra poco.");
    }
    button.disabled = false;
    button.innerHTML = label;
  });
}


// ---------- Email di conferma con link per il calendario (EmailJS) ----------
const MESI = { gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12 };

// Orario di Roma -> data UTC (gestisce da solo ora solare/legale)
function romeToUtc(y, m, d, h, mi) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome", hourCycle: "h23",
    year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(guess));
  const p = Object.fromEntries(parts.map(x => [x.type, +x.value]));
  const asRome = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return new Date(guess - (asRome - guess));
}

// Ricava inizio/fine dal film. Se in films.js c'è  start: "2026-11-09T21:00"  usa quello,
// altrimenti legge il testo di "date" (es. "Lunedì 9 Novembre") e "time" (es. "Ore 21:00").
// Facoltativo: duration (minuti, default 150).
function filmTimes(film) {
  let y, m, d, h = 21, mi = 0;
  if (film.start) {
    const t = film.start.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (!t) return null;
    [y, m, d, h, mi] = t.slice(1).map(Number);
  } else {
    const dm = (film.date || "").toLowerCase().match(/(\d{1,2})\s+([a-zà-ù]+)/);
    if (!dm || !MESI[dm[2]]) return null;
    d = +dm[1]; m = MESI[dm[2]];
    const tm = (film.time || "").match(/(\d{1,2})[:.](\d{2})/);
    if (tm) { h = +tm[1]; mi = +tm[2]; }
    const now = new Date();
    y = now.getFullYear();
    // se la data di quest'anno è passata da più di 60 giorni, si intende l'anno prossimo
    if (romeToUtc(y, m, d, h, mi) < new Date(now - 60 * 864e5)) y += 1;
  }
  const start = romeToUtc(y, m, d, h, mi);
  const end = new Date(start.getTime() + (film.duration || 150) * 60000);
  const f = x => x.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return { start: f(start), end: f(end) };
}

async function sendConfirmationEmail(form) {
  const cfg = window.CONFERMA_CONFIG || {};
  if (!cfg.publicKey || !cfg.serviceId || !cfg.templateId) return false;
  try {
    const film = films[document.getElementById("film").selectedIndex] || films[0];
    const times = filmTimes(film);
    const place = film.venue + ", " + film.address;
    const details = "Prenotazione Cinefriends: " + film.title + ". Ti aspettiamo!";
    let google = "", ics = "";
    if (times) {
      google = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent("Cinefriends: " + film.title) +
        "&dates=" + times.start + "/" + times.end +
        "&details=" + encodeURIComponent(details) +
        "&location=" + encodeURIComponent(place);
      ics = new URL("calendario.html?" + new URLSearchParams({
        t: film.title, s: times.start, e: times.end, l: place, d: details
      }), window.location.href).href;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        service_id: cfg.serviceId, template_id: cfg.templateId, user_id: cfg.publicKey,
        template_params: {
          to_email: form.elements["email"].value,
          to_name: form.elements["name"].value,
          film: film.title, date: film.date, time: film.time,
          venue: film.venue, address: film.address,
          seats: form.elements["Numero di posti"].value,
          attendance: form.elements["Partecipazione"].value,
          google_calendar_url: google, ics_page_url: ics
        }
      })
    });
    clearTimeout(timer);
    return res.ok;
  } catch (err) {
    console.warn("Email di conferma non inviata", err);
    return false;
  }
}
