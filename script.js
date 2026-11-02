const movies = [
  { title: "Midnight Harbour", genre: "Thriller", mins: 118, rating: "15", colors: ["#0f3b4c", "#061a24"], times: ["14:30", "18:00", "21:15"] },
  { title: "The Last Orchard", genre: "Drama", mins: 126, rating: "PG", colors: ["#7a3b1d", "#2e150a"], times: ["13:00", "16:30", "19:45"] },
  { title: "Rocket Pups", genre: "Family", mins: 94, rating: "U", colors: ["#2d6a4f", "#10291e"], times: ["11:00", "13:15", "15:30"] },
  { title: "Laugh Track", genre: "Comedy", mins: 102, rating: "12", colors: ["#8f2d56", "#3a1124"], times: ["15:00", "18:30", "20:45"] },
  { title: "Signal Lost", genre: "Sci-Fi", mins: 134, rating: "12", colors: ["#3f3a8c", "#15133a"], times: ["14:00", "17:30", "21:00"] },
  { title: "Paper Kingdoms", genre: "Family", mins: 98, rating: "U", colors: ["#b5651d", "#4a2608"], times: ["10:30", "12:45", "16:00"] }
];

const PRICE = { matinee: 6, evening: 8 };
const $ = (id) => document.getElementById(id);
let genre = "All", current = null, picked = new Set();

function renderFilters() {
  const genres = ["All", ...new Set(movies.map(m => m.genre))];
  $("filters").innerHTML = genres.map(g =>
    `<button class="chip" aria-pressed="${g === genre}" data-genre="${g}">${g}</button>`).join("");
}

function renderMovies() {
  const list = movies.filter(m => genre === "All" || m.genre === genre);
  $("movies").innerHTML = list.map(m => `
    <article class="movie">
      <div class="poster" style="background: linear-gradient(160deg, ${m.colors[0]}, ${m.colors[1]})">${m.title}</div>
      <h3>${m.title}</h3>
      <p class="muted">${m.genre} &middot; ${m.mins} min &middot; Rated ${m.rating}</p>
      <div class="times">
        ${m.times.map(t => `<button class="stub" data-title="${m.title}" data-time="${t}">${t}</button>`).join("")}
      </div>
    </article>`).join("");
}

$("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  genre = btn.dataset.genre;
  renderFilters();
  renderMovies();
});

$("movies").addEventListener("click", (e) => {
  const btn = e.target.closest(".stub");
  if (btn) openBooking(btn.dataset.title, btn.dataset.time);
});

// Seats already taken are generated from the film and time, so they stay the same each visit.
function takenSeats(seed) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const taken = new Set();
  for (let i = 0; i < 14; i++) { h = (h * 1103515245 + 12345) >>> 0; taken.add(h % 48); }
  return taken;
}

function openBooking(title, time) {
  current = { title, time, price: parseInt(time) < 16 ? PRICE.matinee : PRICE.evening };
  picked.clear();
  const taken = takenSeats(title + time);
  $("b-title").textContent = title;
  $("b-time").textContent = `Today at ${time} · $${current.price} per ticket`;
  $("seats").innerHTML = Array.from({ length: 48 }, (_, i) => {
    const label = "ABCDEF"[Math.floor(i / 8)] + (i % 8 + 1);
    return `<button type="button" class="seat" data-seat="${label}" aria-label="Seat ${label}" aria-pressed="false" ${taken.has(i) ? "disabled" : ""}>${label}</button>`;
  }).join("");
  updateTotal();
  $("booking").showModal();
}

$("seats").addEventListener("click", (e) => {
  const seat = e.target.closest(".seat");
  if (!seat || seat.disabled) return;
  const on = seat.getAttribute("aria-pressed") !== "true";
  seat.setAttribute("aria-pressed", on);
  on ? picked.add(seat.dataset.seat) : picked.delete(seat.dataset.seat);
  updateTotal();
});

function updateTotal() {
  $("b-seats").textContent = picked.size ? [...picked].join(", ") : "none";
  $("b-total").textContent = "$" + picked.size * current.price;
  $("b-confirm").disabled = picked.size === 0;
}

$("booking-form").addEventListener("submit", (e) => {
  if (e.submitter && e.submitter.value === "confirm") {
    showToast(`Booked: ${current.title}, ${current.time}, seats ${[...picked].join(", ")}. See you there, ${$("b-name").value}!`);
    $("b-name").value = "";
  }
});

function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 5000);
}

renderFilters();
renderMovies();
