// 宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + `/posters/`
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const moviePanel = document.querySelector('#moviePanel')

// 函式
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title image
    rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src=${POSTER_URL + item.image} class="card-img-top" alt="movie poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-body">
              <button type="button" class="btn btn-primary moreInfoBtn" data-bs-toggle="modal"
                data-bs-target="#movieModal" data-id="${item.id}">More</button>
              <button type="button" class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
        </div>
      </div>
    </div>`
  });
  moviePanel.innerHTML = rawHTML
}


function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid">`
    modalDate.innerText = 'Release Date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)

  //存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}

// Call API

moviePanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.moreInfoBtn')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)