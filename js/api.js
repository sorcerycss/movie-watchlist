// ============================================================
// api.js — all network / fetch logic
// ============================================================

const API_KEY = "284cda59"
const BASE_URL = "https://www.omdbapi.com"

// Give me a list of movies (basic info)
export async function fetchMovies(query) {
  const res = await fetch(`${BASE_URL}/?s=${query}&apikey=${API_KEY}`)
  const data = await res.json()
  return data.Search ?? null
}

// Give me full details for ONE movie
export async function fetchMovieDetails(imdbID) {
  try {
    const res = await fetch(`${BASE_URL}/?i=${imdbID}&apikey=${API_KEY}`)
    const data = await res.json()
    return data.Response === "True" ? data : null
  } catch (err) {
    console.log("Fetch error:", err)
    return null
  }
}