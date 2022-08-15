// 宣告變數
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + `/posters/`
const movies = [] // 用來存放movie data
const moviePanel = document.querySelector('#moviePanel')
const searchForm = document.querySelector("#searchForm")
const searchInput = document.querySelector("#searchInput")

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
              <button type="button" class="btn btn-outline-secondary addFavoriteBtn" data-id="${item.id}">+</button>
            </div>
        </div>
      </div>
    </div>`
  });
  moviePanel.innerHTML = rawHTML
}

function checkInputValue() {
  const keyWord = document.querySelector("#searchInput").value.trim()
  if (movies.title.includes(keyWord)) {
    console.log("true")
  }
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

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => {
    return movie.id === id
  })) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


// Call API

moviePanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.moreInfoBtn')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.addFavoriteBtn')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})



axios.get(INDEX_URL).then((response) => {
  // 方法1. 利用for迴圈將資料一個一個加入movies內
  //  for (const movie of response.data.results){
  //   movies.push(movie)
  //  }
  // 方法2. 利用...展開運算式即展開陣列元素
  movies.push(...response.data.results)
  renderMovieList(movies)
})
  .catch((err) => console.log(err))

searchForm.addEventListener("click", function searchFormOnClick(event) {
  event.preventDefault()
  let filterMovies = []
  const keyWord = searchInput.value.trim().toLowerCase()
  // if (event.target.matches("#searchButton") && keyWord.length > 0) {
  //   movies.forEach((data) => {
  //     if (data.title.toLowerCase().includes(keyWord)) {
  //       filterMovies.push(data)
  //     }
  //   })
  //   renderMovieList(filterMovies)
  // }

  //助教版本
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  //利用.filter來實現篩選功能
  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyWord)
  )

  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyWord} 沒有符合條件的電影`)
  }

  renderMovieList(filterMovies)
})
