// API KEY: 284cda59
// http://www.omdbapi.com/?i=tt3896198&apikey=284cda59

const searchBtn = document.getElementById("search-btn");
const movieList = document.getElementById("movie-list");
const initialIcon = document.getElementById("initial-icon");
const inputEl = document.getElementById("input-field");

searchBtn.addEventListener("click", () => {
  const query = inputEl.value;

  fetch(`http://www.omdbapi.com/?s=${query}&apikey=284cda59`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      initialIcon.classList.add("hidden");
      movieList.innerHTML = "";

      if (data.Search) {
        data.Search.forEach((movie) => {
          fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=284cda59`)
            .then((res) => res.json())
            .then((details) => {
              movieList.innerHTML += `<div class="movie-card">
              <div>
              <img src="${details.Poster}"/>
              </div>
              <div>
              <h3>${details.Title} ⭐${details.imdbRating}</h3>

              <div class="movie-details">
              <p>${details.Runtime}</p>
              <p>${details.Genre}</p>
              <button>+</button>
              <p>Watchlist</>
              </div>

              <p>${details.Plot}</p>
              </div>
              </div>`;
            });
        });
      } else {
        movieList.innerHTML = `<p>No results found</p>`;
      }
    });
});
