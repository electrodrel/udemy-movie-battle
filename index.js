const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "" : movie.Poster;
    return `
           <img src="${imgSrc}"/>
           ${movie.Title}
       `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchInput) {
    const response = await axios.get("http://www.omdbapi.com/", {
      params: {
        apikey: "17b223ce",
        s: searchInput,
      },
    });
    if (response.data.Error) {
      return [];
    } else {
      return response.data.Search;
    }
  },
};

createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onItemSelect(movie, document.querySelector("#left-summary"), 'left');
  },
});

createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect(movie) {
    document.querySelector(".tutorial").classList.add("is-hidden");
    onItemSelect(movie, document.querySelector("#right-summary"), 'right');
  },
});

const runComparison = () => {
  const leftSideStats = document.querySelectorAll(
    "#left-summary .notification"
  );
  const rightSideStats = document.querySelectorAll(
    "#right-summary .notification"
  );

  leftSideStats.forEach((leftStats, index) => {
    const rightStats = rightSideStats[index];

    const leftSideValue = parseInt(leftStats.dataset.value);
    const rightSideValue = parseInt(rightStats.dataset.value);

    if (leftSideValue > rightSideValue) {
      rightStats.classList.remove("is-primary");
      rightStats.classList.add("is-warning");
    } else if (rightSideValue > leftSideValue) {
      leftStats.classList.remove("is-primary");
      leftStats.classList.add("is-warning");
    }
  });
};

let leftMovie;
let rightMovie;
const onItemSelect = async (item, summary, side) => {
  const result = await axios.get("http://www.omdbapi.com/", {
    params: {
      apikey: "17b223ce",
      i: item.imdbID,
    },
  });
  summary.innerHTML = buildMovieTemplate(result.data);

  if (side === "left") {
    leftMovie = result.data;
  } else if (side === "right") {
    rightMovie = result.data;
  }

  if (leftMovie && rightMovie) {
    runComparison();
  }
};

const buildMovieTemplate = (movieDetail) => {
  const boxOffice = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
  );
  const metaScore = parseInt(movieDetail.Metascore);
  const imdbScore = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

  const awardsNumber = movieDetail.Awards.split(" ").reduce((prev, word) => {
    const value = parseInt(word);

    if (isNaN(value)) {
      return prev;
    }
    return prev + value;
  }, 0);
  return `
          <article class="media">
              <figure class="media-left">
                  <p class="image">
                      <img src="${movieDetail.Poster}"/>
                  </p>
              </figure>
              <div class="media-content">
                  <div class="content">
                      <h1>${movieDetail.Title}</h1>
                      <h4>${movieDetail.Genre}</h4>
                      <p>${movieDetail.Plot}</p>
                  </div>
              </div>
          </article>
          <article data-value=${awardsNumber} class="notification is-primary">
              <p class="title">${movieDetail.Awards}</p>
              <p class="subtitle">Awards</p>
          </article>
          <article data-value=${boxOffice} class="notification is-primary">
              <p class="title">${movieDetail.BoxOffice}</p>
              <p class="subtitle">Box Office</p>
          </article>
          <article data-value=${metaScore} class="notification is-primary">
              <p class="title">${movieDetail.Metascore}</p>
              <p class="subtitle">Metascore</p>
          </article>
          <article data-value=${imdbScore} class="notification is-primary">
              <p class="title">${movieDetail.imdbRating}</p>
              <p class="subtitle">IMDB Rating</p>
          </article>
          <article data-value=${imdbVotes} class="notification is-primary">
              <p class="title">${movieDetail.imdbVotes}</p>
              <p class="subtitle">IMDB Votes</p>
          </article>
      `;
};
