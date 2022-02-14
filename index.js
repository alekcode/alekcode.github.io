"use strict";

(function() {

  const BASE_URL = "https://itunes.apple.com/search?media=movie&";

  window.addEventListener("load", init);

  function init() {
    if (!navigator.onLine) {
      alert("No Internet connection.");
    }
    id("submit").addEventListener("click", () => {
      makeRequest(false);
    });
    id("filter").addEventListener("click", () => {
      makeRequest(true);
    });
  }

  function makeRequest(filter) {
    let term = "term=" + id("search-bar").value;
    id("status").textContent = "Loading...";
    fetch(BASE_URL + term)
      .then(statusCheck)
      .then(res => res.json())
      .then((res) => {
        handleRequest(res, filter);
      })
      .catch(errorHandler);
  }

  function handleRequest(res, filter) {
    id("result-container").innerHTML = "";
    let movies = new Array();
    for (let i = 0; i < res.resultCount; i++) {
      if (filter) {
        if (res.results[i].trackTimeMillis !== undefined) {
          movies[i] = createMovie(res.results[i]);
          id("result-container").appendChild(movies[i]);
        }
      } else {
        movies[i] = createMovie(res.results[i]);
        id("result-container").appendChild(movies[i]);
      }
    }
    if (res.resultCount === 0) {
      id("status").textContent = "No results found.";
    } else {
      id("status").textContent = "Showing " + movies.length + " movie(s).";
    }
  }

  function createMovie(movie) {
    let movDiv = gen("div");
    movDiv.classList.add("movie");

    let thumbnail = gen("img");
    thumbnail.src = movie.artworkUrl100;
    thumbnail.alt = movie.trackName + " thumbnail";
    thumbnail.classList.add("thumbnail");
    movDiv.appendChild(thumbnail);

    let nameDiv = gen("div");
    nameDiv.classList.add("movie-name");

    let title = gen("a");
    title.textContent = movie.trackName;
    title.href = movie.trackViewUrl;
    title.target = "_blank";
    title.classList.add("title");
    nameDiv.appendChild(title);

    let director = gen("p");
    director.textContent = "directed by " + movie.artistName;
    nameDiv.appendChild(director);

    movDiv.appendChild(nameDiv);

    let infoDiv = gen("div");
    infoDiv.classList.add("info");

    let genre = gen("p");
    genre.textContent = "Genre: " + movie.primaryGenreName;
    infoDiv.appendChild(genre);

    let releaseDate = gen("p");
    let date = new Date(movie.releaseDate).toLocaleDateString();
    releaseDate.textContent = "Release date: " + date;
    infoDiv.appendChild(releaseDate);

    let length = gen("p");
    if (movie.trackTimeMillis === undefined) {
      length.textContent = "Runtime: N/A";
    } else {
      let runtime = msToHr(movie.trackTimeMillis);
      length.textContent = "Runtime: " + runtime;
      movDiv.dataset.time = movie.trackTimeMillis;
    }
    infoDiv.appendChild(length);

    let price = gen("p");
    price.textContent = "Rental price: " + movie.trackRentalPrice + " " + movie.currency;
    infoDiv.appendChild(price);

    let rating = gen("p");
    rating.textContent = "Rating: " + movie.contentAdvisoryRating;
    infoDiv.appendChild(rating);

    movDiv.appendChild(infoDiv);

    let preview = gen("a");
    preview.href = movie.previewUrl;
    preview.textContent = "Watch preview";
    preview.target = "_blank";
    movDiv.appendChild(preview);

    return movDiv;
  }

  function msToHr(ms) {
    const MS_IN_HOURS = 3600000;
    const MS_IN_MINUTES = 60000;
    let hours = Math.floor(ms / MS_IN_HOURS);
    let minutes = Math.floor(ms % MS_IN_HOURS / MS_IN_MINUTES);
    return hours + "h " + minutes + "m";
  }

  function errorHandler(err) {
    const TWO_SECONDS = 2000;
    let errorMessage = gen("p");
    errorMessage.textContent = "An error has occcurred. Try again momentarily.";
    errorMessage.classList.add("error");
    id("result-container").appendChild(errorMessage);
    setTimeout(() => {
      errorMessage.remove();
    }, TWO_SECONDS);
  }

  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  function gen(element) {
    return document.createElement(element);
  }

  function id(id) {
    return document.getElementById(id);
  }

})();