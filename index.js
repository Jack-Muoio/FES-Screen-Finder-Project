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


let results = []; // store ALL results

// Trigger search on Enter
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchMovies(searchInput.value.trim());
  }
});

// Trigger sort/filter when dropdown changes
dropdown.addEventListener("change", () => {
  applyFilterAndSort();
});

// Fetch all pages of search results
async function fetchMovies(query) {
  if (!query) return;

  // Update heading immediately
  searchInfoText.innerHTML = `Search results for "<span class="search-query">${query}</span>"`;

  // Show skeleton loader
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

      // 🚫 No results
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

    // Fetch full details for all results
    const detailedResults = await Promise.all(
      allResults.map(async (item) => {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${API_KEY}&i=${item.imdbID}`
        );
        return res.json();
      })
    );

    // After skeleton delay, store results & render
    setTimeout(() => {
      results = detailedResults;
      applyFilterAndSort(); // respects current dropdown selection
    }, 2000);

  } catch (err) {
    console.error(err);
    setTimeout(() => {
      contentEl.innerHTML = "<p>Error loading data</p>";
      searchInfoText.textContent = "Search results:";
    }, 2000);
  }
}


// Apply filter/sort and then display top 6
function applyFilterAndSort() {
  let filtered = [...results];
  const value = dropdown.value;

  // Filter by type (only movie and series now)
  if (["movie", "series"].includes(value)) {
    filtered = filtered.filter((item) => item.Type === value);
  }

  // Sort by year
  if (value === "NEW_TO_OLD") {
    filtered.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
  }
  if (value === "OLD_TO_NEW") {
    filtered.sort((a, b) => parseInt(a.Year) - parseInt(b.Year));
  }

  // Show top 6 after filtering/sorting
  renderResults(filtered.slice(0, 6));
}

// Render the search results
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

// Skeleton/loading HTML
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
