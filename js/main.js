// ============================================================
// main.js — event listeners only; wires everything together
// ============================================================
import { fetchMovies, fetchMovieDetails } from "./api.js"
import { getWatchlist, saveWatchlist } from "./storage.js"
import {
    renderMovies,
    createWatchlistCard,
    showSpinner,
    hideSpinner,
    showError,
} from "./ui.js"

// ── DOM references ────────────────────────────────────────
const searchBtn = document.getElementById("search-btn") // the search button
const movieList = document.getElementById("movie-list") // container where results render
const initialIcon = document.getElementById("initial-icon") // empty-state icon wrapper
const inputEl = document.getElementById("input-field") // the search <input>

// ── Search page ───────────────────────────────────────────
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

  // Trigger search when the user hits Enter
  // works for both adding or removing when navigating through Tab
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchBtn.click()
  })

}

// ── Add to watchlist (event delegation on document) ─────────
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
  if (btn.disabled) return //ignore clicks on already-added btn

  addToWatchlist(btn)

  btn.textContent = "✓"
  btn.disabled = true
  btn.classList.add("is-added")
})

// ── Watchlist page ──────────────────────────────────────────
const listEl = document.getElementById("watchlist")

if (listEl) {

  const clearBtn = document.getElementById("btn-clear")

  // Render watchlist
  function renderWatchlist() {
    const list = getWatchlist()

    // Empty state message
    if (!list.length) {
      clearBtn.classList.add("hidden")
      showError(listEl, "Your watchlist is empty.")
      return
    }

    clearBtn.classList.remove("hidden")

    // Build a simple card for each saved movie
    listEl.innerHTML = list
      .map(movie => createWatchlistCard(movie))
      .join("")
  }

    clearBtn.addEventListener("click", () => {
      saveWatchlist([])
      renderWatchlist()
    })

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