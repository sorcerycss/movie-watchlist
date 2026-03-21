// ============================================================
// CONFIG
// ============================================================
// Public demo API key for OMDb
const API_KEY = "284cda59"
const BASE_URL = "https://www.omdbapi.com"


// ============================================================
// DOM ELEMENTS
// ============================================================
/* SEARCH PAGE ELEMENTS */
const searchBtn = document.getElementById("search-btn") // the search button
const movieList = document.getElementById("movie-list") // container where results render
const initialIcon = document.getElementById("initial-icon") // empty-state icon wrapper
const inputEl = document.getElementById("input-field") // the search <input>
const spinner = document.getElementById("spinner") //spinner


/* =========================
   API FUNCTIONS
   ========================= */
// ============================================================
// API HELPERS  ← pure functions, no DOM touching
// ============================================================

// Give me a list of movies (basic info)
async function fetchMovies(query) {
  const res = await fetch(`${BASE_URL}/?s=${query}&apikey=${API_KEY}`)
  const data = await res.json()
  return data.Search ?? null
}

// Give me full details for ONE movie
async function fetchMovieDetails(imdbID) {
  try {
    const res = await fetch(`${BASE_URL}/?i=${imdbID}&apikey=${API_KEY}`)
    const data = await res.json()
    return data.Response === "True" ? data : null
  } catch (err) {
    console.log("Fetch error:", err)
    return null
  }
}

// ============================================================
// UI HELPERS  ← DOM/HTML functions
// ============================================================
/* =========================
   RENDER FUNCTIONS
   ========================= */

//Take one movie object, return its HTML
        function createMovieCard(movie) {
          const poster = (movie.Poster && movie.Poster !== "N/A")
            ? movie.Poster
            : "https://placehold.co/300x450?text=No+Poster"

          return `
                  <div class="movie-card">
                    <div>
                      <img
                        class="movie-img"
                        src="${poster}"
                        onerror="this.src='https://placehold.co/300x450?text=No+Poster'"
                      />
                    </div>
                    <div class="card-container">
                      <h3 class="movie-title">${movie.Title} ⭐${movie.imdbRating}</h3>
                      <div class="movie-details">
                        <p>${movie.Runtime}</p>
                        <p>${movie.Genre}</p>
                      <!-- The button carries the data we want to save in data-* attributes -->
                        <button
                          class="btn-add"
                          data-id="${movie.imdbID}"
                          data-title="${movie.Title}"
                          data-poster="${movie.Poster}"
                        >+</button>
                        <p class="btn-add-text">Watchlist</p>
                    </div>
                      <p>${movie.Plot}</p>
                    </div>
                  </div>
                  `
        }

        function createWatchlistCard(movie) {
          const poster = (movie.Poster && movie.Poster !== "N/A")
            ? movie.Poster
            : "https://placehold.co/300x450?text=No+Poster"

          return `
            <div class="movie-card">
              <div>
                <img
                  class="movie-img"
                  src="${poster}"
                  alt="${movie.Title}"
                  onerror="this.src='https://placehold.co/300x450?text=No+Poster'"
                />
              </div>
              <div class="card-container">
                <h3 class="movie-title">${movie.Title}</h3>
                <!-- Remove button: carries imdbID -->
                <button 
                  class="btn-remove"
                  data-id="${movie.imdbID}"
                  >x</button>
              </div>
            </div>
          `
        }

        function renderMovies(detailsArray) {
          movieList.innerHTML = detailsArray
          .map(movie => createMovieCard(movie))
          .join("")
        }

        function showSpinner() {
          spinner.classList.remove("hidden")
          movieList.innerHTML = ""
        }

        function hideSpinner() {
          spinner.classList.add("hidden")
        }


        // Error function
        function showError(container, message) {
          container.innerHTML = `
            <div class="unable-text-wrapper">
              <p class="unable-text">${message}</p>
            </div>
          `
        }


// ============================================================
// WATCHLIST HELPERS  ← localStorage functions
// ============================================================
const STORAGE_KEY = "watchlist"

// Small helpers to read/write localStorage cleanly

// "reads from localStorage"
const getWatchlist = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")

// writes to localStorage
const saveWatchlist = (list) =>
   localStorage.setItem(STORAGE_KEY, JSON.stringify(list))


// ============================================================
// EVENT LISTENERS  ← wires everything together
// ============================================================
/* =========================
   SEARCH PAGE
   ========================= */
// Run search logic only on the search page
//  (these elements don’t exist on the watchlist page)
if (searchBtn && movieList && inputEl) {

  // When user clicks Search…
  searchBtn.addEventListener("click", async () => { // turn into async
    const query = inputEl.value // the text the user typed
    if (!query) return // do nothing if input is empty

    // Hide the empty-state icon (so results move up)
    if (initialIcon) initialIcon.classList.add("hidden")
    // Clear previous results
    movieList.innerHTML = ""

    showSpinner()

    try {
       // Await the search
      const movies = await fetchMovies(query)

      // showError function
      if (!movies) {
        hideSpinner()
        showError(movieList, "Unable to find what you're looking for. Please try another search.")
        return
      }

      // Fetch all movies details in parallel with Promise.all
      const detailsArray = (await Promise.all(
        movies.map(movie => fetchMovieDetails(movie.imdbID))
      )).filter(Boolean) // clean final array

      hideSpinner()
      renderMovies(detailsArray)

    } catch (err) {
      console.log("Search failed:", err)
      hideSpinner()
      showError(movieList, "Something went wrong. Please try again.")
    }
  })
}

/* =========================
   ADD TO WATCHLIST
   =========================
   We use event delegation: listen once on document,
   and only react if the click was on a .btn-add.
*/

function addToWatchlist(btn) {
  const list = getWatchlist()

  // Prevent duplicates: if this imdbID already exists, stop
  const id = btn.dataset.id
  const exists = list.some((m) => m.imdbID === id)
  if (exists) return

  // Build the minimal movie record we want to keep
  list.push({
    imdbID: id,
    Title: btn.dataset.title,
    Poster: btn.dataset.poster,
  })

  saveWatchlist(list)
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-add")
  if (!btn) return // ignore clicks that aren’t on an Add button

  addToWatchlist(btn)
})



/* =========================
   WATCHLIST PAGE
   =========================
   Render whatever is saved in localStorage.
   This code only runs if the #watchlist element exists on the page.
*/
const listEl = document.getElementById("watchlist")

if (listEl) {

  // Render watchlist
  function renderWatchlist() {
    const list = getWatchlist()

    // Empty state message
    if (!list.length) {
      showError(listEl, "Your watchlist is empty.")
      return
    }

    // Build a simple card for each saved movie
    listEl.innerHTML = list
      .map(movie => createWatchlistCard(movie))
      .join("")
  }


  // Click handler to remove an item (updates storage, then re-renders)
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-remove")
    if (!btn) return

    // Remove the clicked movie from the stored array
    const id = btn.dataset.id
    const next = getWatchlist().filter((m) => m.imdbID !== id)
    saveWatchlist(next)
    renderWatchlist() // Re-render the list so the UI updates immediately
  })

  renderWatchlist() // Initial render when the page loads

}
