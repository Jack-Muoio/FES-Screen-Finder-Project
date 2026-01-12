function openMenu() {
  document.body.classList += " menu--open"
}

function closeMenu() {
  document.body.classList.remove('menu--open')
}

const API_KEY = "230b0758";
const searchInput = document.querySelector(".search");
const contentEl = document.getElementById("content");
const dropdown = document.querySelector(".dropdown");
const searchInfoText = document.querySelector(".search-info .black-txt");


let results = []; 

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchMovies(searchInput.value.trim());
  }
});

dropdown.addEventListener("change", () => {
  applyFilterAndSort();
});

async function fetchMovies(query) {
  if (!query) return;

  searchInfoText.innerHTML = `Search results for "<span class="search-query">${query}</span>"`;

  contentEl.innerHTML = loadingHTML();

  try {
    let allResults = [];
    let page = 1;
    let totalResults = 0;

    do {
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`
      );
      const data = await res.json();

      if (data.Response === "False") {
        setTimeout(() => {
          contentEl.innerHTML = "<p>No results found</p>";
          searchInfoText.textContent = `No results for "${query}"`;
        }, 2000);
        return;
      }

      allResults = allResults.concat(data.Search);
      totalResults = parseInt(data.totalResults, 10);
      page++;

    } while (allResults.length < totalResults && page <= 10);

    const detailedResults = await Promise.all(
      allResults.map(async (item) => {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}`
        );
        return res.json();
      })
    );

    setTimeout(() => {
      results = detailedResults;
      applyFilterAndSort(); 
    }, 2000);

  } catch (err) {
    console.error(err);
    setTimeout(() => {
      contentEl.innerHTML = "<p>Error loading data</p>";
      searchInfoText.textContent = "Search results:";
    }, 2000);
  }
}


function applyFilterAndSort() {
  let filtered = [...results];
  const value = dropdown.value;

  if (["movie", "series"].includes(value)) {
    filtered = filtered.filter((item) => item.Type === value);
  }

  if (value === "NEW_TO_OLD") {
    filtered.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  }
  if (value === "OLD_TO_NEW") {
    filtered.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  }

  renderResults(filtered.slice(0, 6));
}

function renderResults(items) {
  if (!items.length) {
    contentEl.innerHTML = "<p>No matching results</p>";
    return;
  }

  contentEl.innerHTML = `
    <div class="content-wrapper grid">
      ${items.map(movieCard).join("")}
    </div>
  `;
}

function movieCard(movie) {
  const poster = (!movie.Poster || movie.Poster === "N/A" || movie.Poster.trim() === "")
                 ? "./assets/fallback.png"
                 : movie.Poster;

  return `
    <div class="movie-card">
      <img src="${poster}" alt="${movie.Title}" onerror="this.onerror=null;this.src='./assets/fallback.png';">
      <h3>${movie.Title}</h3>
      <p>${movie.Year}</p>
      <span>${movie.Type}</span>
    </div>
  `;
}


console.log(`Movie: "${movie.Title}" - Poster used: ${poster}`);

function loadingHTML() {
  return `
    <div class="loading-state flex justify-center">
      <i class="fa-solid fa-spinner fa-spin"></i>
    </div>
  `;
}

function notImplemented(e) {
  e.preventDefault();
  alert("This feature has not been implemented yet.");
}
