
// ============================================================
// storage.js — all localStorage logic
// ============================================================

const STORAGE_KEY = "watchlist"

// reads from localStorage
export const getWatchlist = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")

// writes to localStorage
export const saveWatchlist = (list) =>
   localStorage.setItem(STORAGE_KEY, JSON.stringify(list))