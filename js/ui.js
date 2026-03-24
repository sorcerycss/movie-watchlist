// ============================================================
// ui.js — all DOM / rendering logic
// ============================================================

import { getWatchlist } from "./storage.js"

// ── DOM references ──────────────────────────────────────────
const movieList = document.getElementById("movie-list") // container where results render
const spinner = document.getElementById("spinner") //spinner

// ── Card builders ───────────────────────────────────────────
export function createMovieCard(movie, isAdded) {
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
                  class="btn-add ${isAdded ? 'is-added' : ''}"
                  data-id="${movie.imdbID}"
                  data-title="${movie.Title}"
                  data-poster="${movie.Poster}"
                  ${isAdded ? 'disabled' : ''}
                >${isAdded ? '✓' : '+'}</button>
                <p class="btn-add-text">Watchlist</p>
            </div>
              <p>${movie.Plot}</p>
            </div>
          </div>
          `
}

export function createWatchlistCard(movie) {
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

// ── Render helpers ──────────────────────────────────────────
export function renderMovies(detailsArray) {
  const watchlist = getWatchlist()
  movieList.innerHTML = detailsArray
  .map(movie => {
    const isAdded = watchlist.some(m => m.imdbID === movie.imdbID)
    return createMovieCard(movie, isAdded)
  })
  .join("")
}

export function showSpinner() {
  spinner.classList.remove("hidden")
  movieList.innerHTML = ""
}

export function hideSpinner() {
  spinner.classList.add("hidden")
}

export function showError(container, message) {
  container.innerHTML = `
    <div class="unable-text-wrapper">
      <p class="unable-text">${message}</p>
    </div>
  `
}