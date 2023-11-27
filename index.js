// Active state
const ACTIVE_STATE = {
  WindowLoading: 'WindowLoading',
  SearchFormSubmitted: 'SearchFormSubmitted',
  PaginatorClicked: 'PaginatorClicked',
  ToggleButtonClicked: 'ToggleButtonClicked',
  PanelButtonClicked: 'PanelButtonClicked',
}

// Node DOM
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const toggleButtons = document.querySelector('.toggle-btn')

// Model
const model = {
  // Movie API URL
  INDEX_URL: 'https://webdev.alphacamp.io/api/movies/',
  POSTER_URL: 'https://webdev.alphacamp.io/posters/',

  MOVIES_PER_PAGE: 12,
  pageNumber: 1,
  movies: [],
  filteredMovies: [],

  getMoviesByPage() {
    const data = this.filteredMovies.length ? this.filteredMovies : this.movies
    const startIndex = (this.pageNumber - 1) * this.MOVIES_PER_PAGE
    return data.slice(startIndex, startIndex + this.MOVIES_PER_PAGE)
  },

  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = this.movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
      return alert('此電影已加入收藏清單')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  },

  removeFromFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    if (!list || !list.length) return

    const movieIndex = list.findIndex((movie) => movie.id === id)
    if (movieIndex === -1) return

    list.splice(movieIndex, 1)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  },
}

// View
const view = {
  galleryView: true,
  listView: false,

  renderMovieGallery(data) {
    let rawHTML = ''
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    data.forEach((item) => {
      if (list.some((movie) => movie.id === item.id)) {
        rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${model.POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
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
      } else {
        rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src="${model.POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster" />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
        `
      }
    })
    dataPanel.innerHTML = rawHTML
  },

  renderMovieList(data) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    let rawHTML = '<ul class="list-group list-group-flush">'
    data.forEach((item) => {
      if (list.some((movie) => movie.id === item.id)) {
        rawHTML += `
        <li class="list-group-item d-flex justify-content-between py-3">
          <h5 class="list-title">${item.title}</h5>
          <div class="list-btn-group">
            <button class="btn btn-primary btn-show-movie me-2" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id}">More</button>
            <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
          </div>
        </li>
        `
      } else {
        rawHTML += `
        <li class="list-group-item d-flex justify-content-between py-3">
          <h5 class="list-title">${item.title}</h5>
          <div class="list-btn-group">
            <button class="btn btn-primary btn-show-movie me-2" data-bs-toggle="modal" data-bs-target="#movie-modal"
            data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
        `
      }
    })
    rawHTML += '</ul >'
    dataPanel.innerHTML = rawHTML
  },

  renderPaginator(amount) {
    const numberOfPages = Math.ceil(amount / model.MOVIES_PER_PAGE)
    let rawHTML = '<li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>'
    for (let page = 2; page <= numberOfPages; page++) {
      rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
    }
    paginator.innerHTML = rawHTML
  },

  showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')
    axios.get(model.INDEX_URL + id)
      .then((response) => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release date: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${model.POSTER_URL + data.image
          }" alt="movie-poster" class="img-fluid">`
      })
  },
}

// Controller
const controller = {
  currentState: ACTIVE_STATE.WindowLoading,

  initialRender() {
    axios.get(model.INDEX_URL)
      .then((response) => {
        model.movies.push(...response.data.results)
        view.renderPaginator(model.movies.length)
        view.renderMovieGallery(model.getMoviesByPage())
      })
      .catch((error) => {
        console.log(error)
      })
  },

  dispatchActive(event) {
    const target = event.target
    switch (this.currentState) {
      case ACTIVE_STATE.SearchFormSubmitted:
        event.preventDefault()
        const keyword = searchInput.value.trim().toLowerCase()
        if (!keyword.length) {
          window.location.href = "./index.html"
          return
        }
        model.filteredMovies = model.movies.filter((movie) => {
          return movie.title.toLowerCase().includes(keyword)
        })
        if (model.filteredMovies.length === 0) {
          return alert(`找不到符合關鍵字 ${keyword} 的電影`)
        }

        view.renderPaginator(model.filteredMovies.length)
        if (view.galleryView) {
          view.renderMovieGallery(model.getMoviesByPage())
        } else {
          view.renderMovieList(model.getMoviesByPage())
        }
        break

      case ACTIVE_STATE.PaginatorClicked:
        if (target.tagName !== 'A') return
        // 移除分頁器上的 .active
        const pages = document.querySelectorAll('.page-item')
        pages.forEach(page => {
          page.classList.remove('active')
        })
        // 對當前分頁按鈕增加 .active
        target.parentElement.classList.add('active')
        model.pageNumber = Number(target.dataset.page)
        if (view.galleryView) {
          view.renderMovieGallery(model.getMoviesByPage())
        } else {
          view.renderMovieList(model.getMoviesByPage())
        }
        break

      case ACTIVE_STATE.ToggleButtonClicked:
        if (target.classList.contains('gallery')) {
          view.galleryView = true
          view.listView = false
          view.renderMovieGallery(model.getMoviesByPage())
        } else {
          view.galleryView = false
          view.listView = true
          view.renderMovieList(model.getMoviesByPage())
        }
        break

      case ACTIVE_STATE.PanelButtonClicked:
        if (target.matches('.btn-show-movie')) {
          view.showMovieModal(Number(target.dataset.id))
        } else if (target.matches('.btn-add-favorite')) {
          model.addToFavorite(Number(target.dataset.id))
          target.classList.add('btn-danger', 'btn-remove-favorite')
          target.classList.remove('btn-info', 'btn-add-favorite')
          target.innerText = 'x'
        } else if (target.matches('.btn-remove-favorite')) {
          model.removeFromFavorite(Number(target.dataset.id))
          target.classList.add('btn-info', 'btn-add-favorite')
          target.classList.remove('btn-danger', 'btn-remove-favorite')
          target.innerText = '+'
        }
        break
    }
  },
}

// 呼叫函式
controller.initialRender()

// EventListener
dataPanel.addEventListener('click', (event) => {
  controller.currentState = 'PanelButtonClicked'
  controller.dispatchActive(event)
})

paginator.addEventListener('click', (event) => {
  controller.currentState = 'PaginatorClicked'
  controller.dispatchActive(event)
})

searchForm.addEventListener('submit', (event) => {
  controller.currentState = 'SearchFormSubmitted'
  controller.dispatchActive(event)
})

toggleButtons.addEventListener('click', (event) => {
  controller.currentState = 'ToggleButtonClicked'
  controller.dispatchActive(event)
})