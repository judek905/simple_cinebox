const movies = [
  { title: "Midnight Harbour", genre: "Thriller", mins: 118, rating: "15", fmt: "2D", colors: ["#0f3b4c", "#061a24"], times: ["14:30", "18:00", "21:15"],
    text: "A night-shift ferry pilot sees something in the fog that the port authority says never happened.", cast: "Amara Odell, Tomas Reyes" },
  { title: "The Last Orchard", genre: "Drama", mins: 126, rating: "PG", fmt: "2D", colors: ["#7a3b1d", "#2e150a"], times: ["13:00", "16:30", "19:45"],
    text: "Three generations argue over whether to sell the family farm in the year the trees bloom early.", cast: "Ruth Mwangi, Daniel Okafor" },
  { title: "Rocket Pups", genre: "Family", mins: 94, rating: "U", fmt: "3D", colors: ["#2d6a4f", "#10291e"], times: ["11:00", "13:15", "15:30"],
    text: "Five puppies stow away on a school's model rocket and have to land it before bedtime.", cast: "Voices of Lily Chen, Sam Patel" },
  { title: "Laugh Track", genre: "Comedy", mins: 102, rating: "12", fmt: "2D", colors: ["#8f2d56", "#3a1124"], times: ["15:00", "18:30", "20:45"],
    text: "A failing sitcom writer must make a funeral funny, for a client who is still in the room.", cast: "Jo Banda, Priya Nair" },
  { title: "Signal Lost", genre: "Sci-Fi", mins: 134, rating: "12", fmt: "Atmos", colors: ["#3f3a8c", "#15133a"], times: ["14:00", "17:30", "21:00"],
    text: "When every satellite goes silent at once, a radio hobbyist becomes the last link between two continents.", cast: "Kenji Aoki, Elena Vasquez" },
  { title: "Paper Kingdoms", genre: "Family", mins: 98, rating: "U", fmt: "2D", colors: ["#b5651d", "#4a2608"], times: ["10:30", "12:45", "16:00"],
    text: "A girl folds a city out of newspaper, and its tiny citizens start asking for a say in how it is run.", cast: "Voices of Ada Kato, Leo Brandt" }
];

const soon = [
  { title: "The Salt Road", genre: "Adventure", date: "Next Friday" },
  { title: "Quiet Hours", genre: "Drama", date: "In two weeks" },
  { title: "Moon Market", genre: "Family", date: "In three weeks" }
];

const PRICE = { matinee: 6, evening: 8, student: 5 };
const MAX_SEATS = 8;
const $ = (id) => document.getElementById(id);
const days = [0, 1, 2].map(i => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
const dayLabel = (d, i) => i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const mins = (t) => parseInt(t) * 60 + parseInt(t.slice(3));

let genre = "All", day = 0, current = null;
const picked = new Set();

function renderDays() {
  $("days").innerHTML = days.map((d, i) =>
    `<button class="chip" aria-pressed="${i === day}" data-day="${i}">${dayLabel(d, i)}</button>`).join("");
}

function renderFilters() {
  const genres = ["All", ...new Set(movies.map(m => m.genre))];
  $("filters").innerHTML = genres.map(g =>
    `<button class="chip" aria-pressed="${g === genre}" data-genre="${g}">${g}</button>`).join("");
}

function renderMovies() {
  const now = new Date(), nowMins = now.getHours() * 60 + now.getMinutes();
  const list = movies.filter(m => genre === "All" || m.genre === genre);
  if (!list.length) { $("movies").innerHTML = `<p class="empty">No films in this genre. Choose another one.</p>`; return; }
  $("movies").innerHTML = list.map(m => `
    <article class="movie">
      <div class="poster" style="background: linear-gradient(160deg, ${m.colors[0]}, ${m.colors[1]})" aria-hidden="true">${m.title}</div>
      <h3>${m.title}<span class="badge">${m.fmt}</span></h3>
      <p class="muted">${m.genre} &middot; ${m.mins} min &middot; Rated ${m.rating}</p>
      <p class="synopsis">${m.text}</p>
      <p class="cast">Starring ${m.cast}</p>
      <div class="times">
        ${m.times.map(t => {
          const past = day === 0 && mins(t) <= nowMins;
          return `<button class="stub" data-title="${m.title}" data-time="${t}" ${past ? "disabled title='This show has started'" : ""}>${t}</button>`;
        }).join("")}
      </div>
    </article>`).join("");
}

function renderSoon() {
  $("soon").innerHTML = soon.map(s => `<li><span>${s.title} <span class="muted">${s.genre}</span></span><span class="date">${s.date}</span></li>`).join("");
}

$("days").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  day = +b.dataset.day; renderDays(); renderMovies();
});

$("filters").addEventListener("click", (e) => {
  const b = e.target.closest(".chip");
  if (!b) return;
  genre = b.dataset.genre; renderFilters(); renderMovies();
});

$("movies").addEventListener("click", (e) => {
  const b = e.target.closest(".stub");
  if (b && !b.disabled) openBooking(b.dataset.title, b.dataset.time);
});

// Taken seats come from the film, day and time, so they stay the same on every visit.
function takenSeats(seed) {
  let h = 7;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const taken = new Set();
  for (let i = 0; i < 14; i++) { h = (h * 1103515245 + 12345) >>> 0; taken.add((h >>> 8) % 48); }
  return taken;
}

function ticketPrice() {
  return $("b-type").value === "student" ? PRICE.student : (mins(current.time) < 16 * 60 ? PRICE.matinee : PRICE.evening);
}

function openBooking(title, time) {
  current = { title, time };
  picked.clear();
  $("b-type").value = "standard";
  const taken = takenSeats(`${title}${time}${day}`);
  $("b-title").textContent = title;
  $("b-time").textContent = `${dayLabel(days[day], day)}, ${days[day].toLocaleDateString("en-GB", { day: "numeric", month: "long" })} at ${time}`;
  $("seats").innerHTML = Array.from({ length: 48 }, (_, i) => {
    const label = "ABCDEF"[Math.floor(i / 8)] + (i % 8 + 1);
    return `<button type="button" class="seat" data-seat="${label}" aria-label="Seat ${label}${taken.has(i) ? ", taken" : ""}" aria-pressed="false" ${taken.has(i) ? "disabled" : ""}>${label}</button>`;
  }).join("");
  updateTotal();
  $("booking").showModal();
}

$("seats").addEventListener("click", (e) => {
  const seat = e.target.closest(".seat");
  if (!seat || seat.disabled) return;
  const on = seat.getAttribute("aria-pressed") !== "true";
  if (on && picked.size >= MAX_SEATS) { showToast(`You can book up to ${MAX_SEATS} seats at a time.`); return; }
  seat.setAttribute("aria-pressed", on);
  on ? picked.add(seat.dataset.seat) : picked.delete(seat.dataset.seat);
  updateTotal();
});

$("b-type").addEventListener("change", updateTotal);

function updateTotal() {
  $("b-seats").textContent = picked.size ? [...picked].sort().join(", ") : "none chosen yet";
  $("b-total").textContent = "$" + picked.size * ticketPrice();
  $("b-confirm").disabled = picked.size === 0;
}

$("booking-form").addEventListener("submit", (e) => {
  if (!e.submitter || e.submitter.value !== "confirm") return;
  const ref = "LUM-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  showToast(`Booked, ${$("b-name").value.trim()}! ${current.title}, ${current.time}, seats ${[...picked].sort().join(", ")}. Reference ${ref}.`);
  $("b-name").value = "";
});

// Clicking the dark area outside the ticket closes it.
$("booking").addEventListener("click", (e) => { if (e.target === $("booking")) $("booking").close(); });

$("news").addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("You're on the list. Look out for the Thursday programme.");
  e.target.reset();
});

let toastTimer;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 6000);
}

renderDays(); renderFilters(); renderMovies(); renderSoon();
