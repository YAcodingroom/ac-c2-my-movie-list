const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = `${BASE_URL}/api/movies/`
const POSTER_URL = `${BASE_URL}/posters/`

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

function renderMovieList(data) {
  if (!movies || !movies.length) {
    window.location.href = "./index.html"
    return
  }

  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
    })
}

function removeFromFavorite(id) {
  if (!movies || !movies.length) return
  // 如果收藏清單是空的 就結束函式

  const movieIndex = movies.findIndex((movie) => movie.id === id)
  // 找出傳入的 id 在收藏清單內的索引位置
  if (movieIndex === -1) return
  // 如果傳入的 id 在收藏清單中不存在(索引位置回傳 -1) 就結束函式

  movies.splice(movieIndex, 1)
  // 移除該索引位置的資料

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  // 將新的清單覆蓋存入 localStorage
  renderMovieList(movies)
  // 重新渲染畫面
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)