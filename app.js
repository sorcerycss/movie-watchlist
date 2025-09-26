// Public demo API key for OMDb
const API_KEY = "284cda59";

/* =========================
   SEARCH PAGE ELEMENTS
   ========================= */
const searchBtn = document.getElementById("search-btn"); // the search button
const movieList = document.getElementById("movie-list"); // container where results render
const initialIcon = document.getElementById("initial-icon"); // empty-state icon wrapper
const inputEl = document.getElementById("input-field"); // the search <input>

/* Run search logic only on the search page
   (these elements don’t exist on the watchlist page) */
if (searchBtn && movieList && inputEl) {
  // When user clicks Search…
  searchBtn.addEventListener("click", () => {
    const query = inputEl.value; // the text the user typed
    if (!query) return; // do nothing if input is empty

    // Hide the empty-state icon (so results move up)
    if (initialIcon) initialIcon.classList.add("hidden");

    // Clear previous results
    movieList.innerHTML = "";

    // 1) Search OMDb by title text (`s=` returns a lightweight list)
    fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`)
      .then((res) => res.json())
      .then((data) => {
        // If OMDb didn’t find anything, show friendly message and stop
        if (!data.Search) {
          movieList.innerHTML = `
          <div class="unable-text-wrapper">
            <p class="unable-text">Unable to find what you're looking for. Please try another search.</p>
          </div>`;
          return;
        }

        // 2) For each search result, fetch full details using imdbID (`i=`)
        data.Search.forEach((movie) => {
          fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`)
            .then((res) => res.json())
            .then((details) => {
              // We’ll use the poster URL from details. (Tip: you can add a fallback if it's "N/A")
              const poster = details.Poster;

              // 3) Append one movie card to the results list.
              //    Includes a minimal "Add" button that stores to localStorage.
              movieList.innerHTML += `
                <div class="movie-card">
                  <div>
                    <img class="movie-img" src="${details.Poster}"/>
                  </div>

                  <div class="card-container">
                    <h3 class="movie-title">${details.Title} ⭐${details.imdbRating}</h3>

                    <div class="movie-details">
                      <p>${details.Runtime}</p>
                      <p>${details.Genre}</p>

                      <!-- The button carries the data we want to save in data-* attributes -->
                      <button
                        class="btn-add"
                        data-id="${details.imdbID}"
                        data-title="${details.Title}"
                        data-poster="${poster}"
                      >+</button>

                      <p class="btn-add-text">Watchlist</p>
                    </div>

                    <p>${details.Plot}</p>
                  </div>
                </div>`;
            });
        });
      });
  });
}

/* =========================
   ADD TO WATCHLIST (shared)
   =========================
   We use event delegation: listen once on document,
   and only react if the click was on a .btn-add.
*/
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add");
  if (!btn) return; // ignore clicks that aren’t on an Add button

  // Read current list from localStorage (or start empty)
  const list = JSON.parse(localStorage.getItem("watchlist") || "[]");

  // Prevent duplicates: if this imdbID already exists, stop
  const id = btn.dataset.id;
  const exists = list.some((m) => m.imdbID === id);
  if (exists) return;

  // Build the minimal movie record we want to keep
  list.push({
    imdbID: id,
    Title: btn.dataset.title,
    Poster: btn.dataset.poster,
  });

  // Save back to localStorage (persists across page reloads and pages)
  localStorage.setItem("watchlist", JSON.stringify(list));
});

/* =========================
   WATCHLIST PAGE
   =========================
   Render whatever is saved in localStorage.
   This code only runs if the #watchlist element exists on the page.
*/
const listEl = document.getElementById("watchlist");

if (listEl) {
  const STORAGE_KEY = "watchlist";

  // Small helpers to read/write localStorage cleanly
  const getWatchlist = () =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  const saveWatchlist = (list) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  // Render the full watchlist into the container
  function renderWatchlist() {
    const list = getWatchlist();

    // Empty state message
    if (!list.length) {
      listEl.innerHTML = `
        <div class="unable-text-wrapper">
          <p class="unable-text">Your watchlist is empty.</p>
        </div>`;
      return;
    }

    // Build a simple card for each saved movie
    listEl.innerHTML = list
      .map(
        (m) => `
        <div class="movie-card">
          <div>
            <img class="movie-img" src="${m.Poster}" alt="${m.Title} poster"/>
          </div>
          <div class="card-container">
            <h3 class="movie-title">${m.Title}</h3>
            <!-- Remove button: carries imdbID -->
            <button class="btn-remove" data-id="${m.imdbID}">x</button>
          </div>
        </div>`
      )
      .join("");
  }

  // Initial render when the page loads
  renderWatchlist();

  // Click handler to remove an item (updates storage, then re-renders)
  listEl.addEventListener("click", (e) => {
    const rm = e.target.closest(".btn-remove");
    if (!rm) return;

    const id = rm.dataset.id;

    // Remove the clicked movie from the stored array
    const next = getWatchlist().filter((m) => m.imdbID !== id);
    saveWatchlist(next);

    // Re-render the list so the UI updates immediately
    renderWatchlist();
  });
}
