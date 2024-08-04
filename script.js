document.addEventListener("DOMContentLoaded", function() {
  const mangaList = [
    "Jagaaaaaan",
    "The Fable",
    "Undead Unluck",
    "One Punch Man",
    "Chainsaw Man",
    "Kemono Jihen",
    "Kanojo, Okarishimasu",
    "Nazo no Kanojo X",
    "Jujutsu Kaisen",
    "Dr. Stone"
  ];

  const mangaContainer = document.getElementById("manga-container");

  async function fetchMangaData(manga) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(manga)}`);
      const data = await response.json();
      return data.data[0];
    } catch (error) {
      console.error("Error fetching manga data:", error);
    }
  }

  async function displayManga() {
    for (let i = 0; i < mangaList.length; i++) {
      const manga = mangaList[i];

      setTimeout(async () => {
        const mangaData = await fetchMangaData(manga);

        if (mangaData) {
          const card = document.querySelectorAll('.card')[i];
          const img = card.querySelector('.manga-cover');
          const title = card.querySelector('.manga-title');
          const link = card.querySelector('a');

          img.src = mangaData.images.jpg.large_image_url;
          img.alt = mangaData.title;
          title.textContent = mangaData.title;
          link.href = `./info.html?id=${mangaData.mal_id}`;

          link.addEventListener('click', function() {
            localStorage.setItem('selectedMangaId', mangaData.mal_id);
          });
        }
      }, i * 1000);
    }
  }

  displayManga();

  const urlParams = new URLSearchParams(window.location.search);
  const mangaId = urlParams.get('id') || localStorage.getItem('selectedMangaId');

  if (mangaId && window.location.pathname.includes('info.html')) {
    fetchMangaDetails(mangaId);
  }

  async function fetchMangaDetails(id) {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
      const data = await response.json();
      const manga = data.data;

      document.getElementById("mangaInfo-title").textContent = manga.title;
      document.getElementById("mangaInfo-cover").src = manga.images.jpg.large_image_url;
      document.getElementById("mangaInfo-cover").alt = manga.title;
      document.getElementById("ranked").textContent = manga.rank;
      document.getElementById("popularity").textContent = manga.popularity;
      document.getElementById("publish").textContent = manga.published.string;
      document.getElementById("genre").textContent = manga.genres.map(genre => genre.name).join(', ');
      document.getElementById("themes").textContent = manga.themes.map(theme => theme.name).join(', ');
      document.getElementById("demographic").textContent = manga.demographics.map(demo => demo.name).join(', ');
      document.getElementById("serialization").textContent = manga.serializations.map(ser => ser.name).join(', ');
      document.getElementById("authors").textContent = manga.authors.map(author => author.name).join(', ');
      document.getElementById("synopsis").textContent = manga.synopsis || "No synopsis available";

      const charResponse = await fetch(`https://api.jikan.moe/v4/manga/${id}/characters`);
      const charData = await charResponse.json();
      const characters = charData.data;
      const charactersContainer = document.getElementById("characters");
      charactersContainer.innerHTML = '';

      characters.forEach(character => {
        const charElement = document.createElement("div");
        charElement.classList.add("character");
        const charImg = document.createElement("img");
        charImg.src = character.character.images.jpg.image_url;
        charImg.alt = character.character.name;
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
});
