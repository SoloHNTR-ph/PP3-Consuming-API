document.addEventListener("DOMContentLoaded", function () {
  const mangaList = [
    "Berserk",
    "Shingeki no Kyojin",
    "Chainsaw Man",
    "One Piece",
    "One Punch-Man",
    "Tokyo Ghoul",
    "Kimetsu no Yaiba",
    "Boku no Hero Academia",
    "Jujutsu Kaisen",
    "Naruto",
  ];

  const mangaContainer = document.querySelectorAll("#manga-container");

  async function fetchMangaData(manga) {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(manga)}`
      );
      const data = await response.json();
      return data.data[0];
    } catch (error) {
      console.error("Error fetching manga data:", error);
    }
  }

  async function fetchMangaDetails(id) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
      const data = await response.json();
      const manga = data.data;

      document.getElementById("manga-title").textContent = manga.title;
      document.getElementById("manga-cover").src =
        manga.images.jpg.large_image_url;
      document.getElementById("manga-cover").alt = manga.title;
      document.getElementById("ranked").textContent = manga.rank;
      document.getElementById("popularity").textContent = manga.popularity;
      document.getElementById("publish").textContent = manga.published.string;
      document.getElementById("genre").textContent = manga.genres
        .map((genre) => genre.name)
        .join(", ");
      document.getElementById("themes").textContent = manga.themes
        .map((theme) => theme.name)
        .join(", ");
      document.getElementById("demographic").textContent = manga.demographics
        .map((demo) => demo.name)
        .join(", ");
      document.getElementById("serialization").textContent =
        manga.serializations.map((ser) => ser.name).join(", ");
      document.getElementById("authors").textContent = manga.authors
        .map((author) => author.name)
        .join(", ");
      document.getElementById("synopsis").textContent =
        manga.synopsis || "No synopsis available";

      const charResponse = await fetch(
        `https://api.jikan.moe/v4/manga/${id}/characters`
      );
      const charData = await charResponse.json();
      const characters = charData.data;
      const charactersContainer = document.getElementById("characters");
      charactersContainer.innerHTML = "";

      characters.forEach((character) => {
        const charElement = document.createElement("div");
        charElement.classList.add("character");
        const charImg = document.createElement("img");
        charImg.src = character.character.images.jpg.image_url;
        charImg.alt = character.character.name;
        charImg.style.width = "100px";
        charImg.style.height = "auto";
        const charName = document.createElement("p");
        charName.textContent = character.character.name;
        charElement.appendChild(charImg);
        charElement.appendChild(charName);
        charactersContainer.appendChild(charElement);
      });
    } catch (error) {
      console.error("Error fetching manga details:", error);
    }
  }

  async function fetchSearchResults(query) {
    try {
      const response = await fetch(
        `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      let mangaList = data.data;
      const searchResultsContainer = document.getElementById("search-results");
      searchResultsContainer.innerHTML = "";

      if (mangaList.length === 0) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "No results found for your search.";
        errorMessage.classList.add("error-message");
        searchResultsContainer.appendChild(errorMessage);
      } 
      else {
        mangaList = mangaList.slice(0, 24);
        mangaList.forEach((manga) => {
          const card = document.createElement("div");
          card.classList.add("card", "col");
          const link = document.createElement("a");
          link.href = `./info.html?id=${manga.mal_id}`;
          const img = document.createElement("img");
          img.src = manga.images.jpg.large_image_url;
          img.alt = manga.title;
          img.classList.add("manga-cover");
          const cardBody = document.createElement("div");
          cardBody.classList.add("card-body");
          const title = document.createElement("h5");
          title.classList.add("manga-title");
          title.textContent = manga.title;

          link.appendChild(img);
          cardBody.appendChild(title);
          card.appendChild(link);
          card.appendChild(cardBody);
          searchResultsContainer.appendChild(card);
        });
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  }

  async function displayManga() {
    for (let i = 0; i < mangaList.length; i++) {
      const manga = mangaList[i];

      setTimeout(async () => {
        const mangaData = await fetchMangaData(manga);

        if (mangaData) {
          const containerIndex = Math.floor(i / 5);
          const container = mangaContainer[containerIndex];

          if (!container) {
            console.error(`Container at index ${containerIndex} not found`);
            return;
          }

          const card = container.querySelectorAll(".card")[i % 5];
          const img = card.querySelector(".manga-cover");
          const title = card.querySelector(".manga-title");
          const link = card.querySelector("a");

          img.src = mangaData.images.jpg.large_image_url;
          img.alt = mangaData.title;
          title.textContent = mangaData.title;
          link.href = `./info.html?id=${mangaData.mal_id}`;

          link.addEventListener("click", function () {
            localStorage.setItem("selectedMangaId", mangaData.mal_id);
          });
        }
      }, i * 1000);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const mangaId =
    urlParams.get("id") || localStorage.getItem("selectedMangaId");

  if (mangaId && window.location.pathname.includes("info.html")) {
    fetchMangaDetails(mangaId);
  }

  const searchForm = document.querySelector("form");
  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const searchInput = document.querySelector("input[type='search']");
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `./search.html?query=${encodeURIComponent(
          query
        )}`;
      }
    });
  }

  if (window.location.pathname.includes("search.html")) {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get("query");
    if (searchQuery) {
      fetchSearchResults(searchQuery);
    }
  }

  displayManga();
});
