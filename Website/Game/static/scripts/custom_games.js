document.addEventListener('DOMContentLoaded', function () {
    function toggleTimerInput() {
        var timerActiveSelect = document.getElementById('timerstatus-select')
        var durationSection = document.getElementById('duration-section')
      
        durationSection.style.display = timerActiveSelect.value === 'True' ? 'block' : 'none'
      }

    const games = document.getElementById('all-games')
    const currentGames = document.getElementById('current-games')
    const sortingSelect = document.getElementById('sorting-select')
    const gameArray = Array.from(games.children)
    const gamesPerPage = 5
  
    function sortGames(games) {
      const sortResults = games
      const sortingOption = sortingSelect.value
  
      if (sortingOption === 'newest') {
        sortResults.sort((a, b) => {
          const dateA = new Date(a.querySelector('.game-date').textContent)
          const dateB = new Date(b.querySelector('.game-date').textContent)
          return dateB - dateA
        })
      } else if (sortingOption === 'rating') {
        sortResults.sort((a, b) => {
          const likesA = parseInt(a.querySelector('.game-likes').textContent.split(' ')[0])
          const dislikesA = parseInt(a.querySelector('.game-dislikes').textContent.split(' ')[0])
          const diffA = likesA - dislikesA;

          const likesB = parseInt(b.querySelector('.game-likes').textContent.split(' ')[0])
          const dislikesB = parseInt(b.querySelector('.game-dislikes').textContent.split(' ')[0])
          const diffB = likesB - dislikesB;

          return diffB - diffA
        })
      }
  
      sessionStorage.setItem('selectedOption', sortingOption)
  
      return sortResults
    }
  
    const filterBtn = document.getElementById('filter-btn')
    const filterMenu = document.getElementById('filter-menu')
    const filterMenuBackground = document.getElementById('filter-menu-background')
    const applyFiltersBtn = document.getElementById('apply-filters')
    const cancelFiltersBtn = document.getElementById('cancel-filters')
  
    function openFilterMenu() {
      filterMenu.style.display = 'block'
      filterMenuBackground.style.display = 'block'
    }
  
    function closeFilterMenu() {
      filterMenu.style.display = 'none'
      filterMenuBackground.style.display = 'none'
    }
  
    filterBtn.addEventListener('click', openFilterMenu)
  
    function applyFilters() {
      // Apply filters logic here
      const mobilityFilter = document.getElementById('mobility-select').value
      const difficultyFilter = document.getElementById('difficulty-select').value
      const timerStatusFilter = document.getElementById('timerstatus-select').value
      const timerDurationFilter = document.getElementById('duration-input').value
      function getDatePostedFilter() {
        const datePostedRadios = document.getElementsByName('date-posted')
        for (const radio of datePostedRadios) {
          if (radio.checked) {
            return radio.value
          }
        }
        return null
      }
      const datePostedFilter = getDatePostedFilter()
  
      const filterResults = gameArray.filter((game) => {
        const gameMobility = game.querySelector('.game-mobility').textContent.split(' ')[0]
        const gameDifficulty = game.querySelector('.game-difficulty').textContent.split(' ')[0]
        const gameTimerStatus = game.querySelector('.game-timerstatus').textContent
        const gameDuration = parseInt(game.querySelector('.game-duration').textContent.split(' ')[0])
        const gameDate = new Date(game.querySelector('.game-date').textContent.split(' ')[0])

        const mobilityFilterPassed = !mobilityFilter || gameMobility === mobilityFilter
        const difficultyFilterPassed = !difficultyFilter || gameDifficulty === difficultyFilter
        const timerstatusFilterPassed = !timerStatusFilter || gameTimerStatus === timerStatusFilter
        const durationFilterPassed = !timerDurationFilter || gameDuration >= timerDurationFilter
        const timeFilterPassed = timerstatusFilterPassed && (gameTimerStatus === 'False' ? true : durationFilterPassed)

        let datePostedFilterPassed = true
        const currentDate = new Date()
        if (datePostedFilter === 'today') {
          const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
          datePostedFilterPassed = gameDate >= today
        } else if (datePostedFilter === 'this-week') {
          const oneWeekAgo = new Date(currentDate - 7 * 24 * 60 * 60 * 1000)
          datePostedFilterPassed = gameDate >= oneWeekAgo
        } else if (datePostedFilter === 'this-month') {
          const oneMonthAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 1))
          datePostedFilterPassed = gameDate >= oneMonthAgo
        } else if (datePostedFilter === 'this-year') {
          const oneYearAgo = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1))
          datePostedFilterPassed = gameDate >= oneYearAgo
        }

        return mobilityFilterPassed && difficultyFilterPassed && timeFilterPassed && datePostedFilterPassed
      })
  
      // Close the filter menu
      closeFilterMenu()
  
      // Update filter bubbles
      saveFiltersToSessionStorage()
      updateFilterBubbles()
  
      return filterResults
    }
  
    applyFiltersBtn.addEventListener('click', updateGames)
  
    cancelFiltersBtn.addEventListener('click', () => {
      closeFilterMenu()
    })
  
    function updateFilterBubbles() {
      const filterBubbles = document.getElementById('filter-bubbles')
      filterBubbles.innerHTML = ''
  
      const mobilityFilter = document.getElementById('mobility-select').value
      const difficultyFilter = document.getElementById('difficulty-select').value
      const timerStatusFilter = document.getElementById('timerstatus-select').value
      const timerDurationFilter = document.getElementById('duration-input').value
      const datePostedFilters = document.getElementsByName('date-posted')
      let datePostedFilter
      datePostedFilters.forEach((radio) => {
        if (radio.checked) datePostedFilter = radio.value
      })
  
      if (mobilityFilter) {
        const mobilityBubble = document.createElement('span')
        mobilityBubble.classList.add('filter-bubble')
        if (mobilityFilter == 'True') {
          mobilityBubble.textContent = `Movement allowed`
        } else {
          mobilityBubble.textContent = `Movement not allowed`
        }
        const mobilityBubbleClose = document.createElement('span')
        mobilityBubbleClose.classList.add('filter-bubble-close')
        mobilityBubbleClose.innerHTML = ' &times;'
        mobilityBubbleClose.onclick = () => {
          document.getElementById('mobility-select').value = ''
          updateGames()
          sessionStorage.removeItem('mobilityFilter')
        }
        mobilityBubble.appendChild(mobilityBubbleClose)
        filterBubbles.appendChild(mobilityBubble)
      }
  
      if (difficultyFilter) {
        const difficultyBubble = document.createElement('span')
        difficultyBubble.classList.add('filter-bubble')
        difficultyBubble.textContent = `${difficultyFilter}`
        const difficultyBubbleClose = document.createElement('span')
        difficultyBubbleClose.classList.add('filter-bubble-close')
        difficultyBubbleClose.innerHTML = ' &times;'
        difficultyBubbleClose.onclick = () => {
          document.getElementById('difficulty-select').value = ''
          updateGames()
          sessionStorage.removeItem('difficultyFilter')
        }
        difficultyBubble.appendChild(difficultyBubbleClose)
        filterBubbles.appendChild(difficultyBubble)
      }
  
      if (timerStatusFilter) {
        const timerStatusBubble = document.createElement('span')
        timerStatusBubble.classList.add('filter-bubble')
        if (timerStatusFilter == 'True') {
          timerStatusBubble.textContent = `Timer enabled`
        } else {
          timerStatusBubble.textContent = `Timer disabled`
        }
        const timerStatusBubbleClose = document.createElement('span')
        timerStatusBubbleClose.classList.add('filter-bubble-close')
        timerStatusBubbleClose.innerHTML = ' &times;'
        timerStatusBubbleClose.onclick = () => {
          document.getElementById('timerstatus-select').value = ''
          document.getElementById('duration-input').value = '0'
          updateGames()
          sessionStorage.removeItem('timerStatusFilter')
        }
        timerStatusBubble.appendChild(timerStatusBubbleClose)
        filterBubbles.appendChild(timerStatusBubble)
        if (timerDurationFilter > 5) {
          const durationBubble = document.createElement('span')
          durationBubble.classList.add('filter-bubble')
          durationBubble.textContent = `>= ${timerDurationFilter} seconds`
          const durationBubbleClose = document.createElement('span')
          durationBubbleClose.classList.add('filter-bubble-close')
          durationBubbleClose.innerHTML = ' &times;'
          durationBubbleClose.onclick = () => {
            document.getElementById('duration-input').value = 5
            updateGames()
            sessionStorage.removeItem('timerDurationFilter')
          }
          durationBubble.appendChild(durationBubbleClose)
          filterBubbles.appendChild(durationBubble)
        }
      }
  
      if (datePostedFilter) {
        const datePostedBubble = document.createElement('span')
        datePostedBubble.classList.add('filter-bubble')
        if (`${datePostedFilter}` === 'today') {
          datePostedBubble.textContent = 'today';
        } else if (`${datePostedFilter}` === 'this-week') {
          datePostedBubble.textContent = 'this week';
        } else if (`${datePostedFilter}` === 'this-month') {
          datePostedBubble.textContent = 'this month';
        } else if (`${datePostedFilter}` === 'this-year') {
          datePostedBubble.textContent = 'this year';
        }
        const datePostedBubbleClose = document.createElement('span')
        datePostedBubbleClose.classList.add('filter-bubble-close')
        datePostedBubbleClose.innerHTML = ' &times;'
        datePostedBubbleClose.onclick = () => {
          datePostedFilters.forEach((radio) => {
            radio.checked = false
          })
          updateGames()
          sessionStorage.removeItem('datePostedFilter')
        }
        datePostedBubble.appendChild(datePostedBubbleClose)
        filterBubbles.appendChild(datePostedBubble)
      }
    }
  
    // Save filters to sessionStorage
    function saveFiltersToSessionStorage() {
      const mobilityFilter = document.getElementById('mobility-select').value
      const difficultyFilter = document.getElementById('difficulty-select').value
      const timerStatusFilter = document.getElementById('timerstatus-select').value
      const timerDurationFilter = document.getElementById('duration-input').value
      const datePostedFilters = document.getElementsByName('date-posted')
      let datePostedFilter
      datePostedFilters.forEach((radio) => {
        if (radio.checked) datePostedFilter = radio.value
      })
  
      sessionStorage.setItem('mobilityFilter', mobilityFilter)
      sessionStorage.setItem('difficultyFilter', difficultyFilter)
      sessionStorage.setItem('timerStatusFilter', timerStatusFilter)
      sessionStorage.setItem('timerDurationFilter', timerDurationFilter)
      sessionStorage.setItem('datePostedFilter', datePostedFilter)
    }
  
    const durationInput = document.getElementById('duration-input')
    const durationOutput = document.getElementById('duration-output')
  
    durationOutput.textContent = durationInput.value + ' seconds'
    // Update the output value whenever the input value changes
    durationInput.addEventListener('input', () => {
      durationOutput.textContent = durationInput.value + ' seconds'
    })
  
    const titleSearch = document.getElementById('title-search')
    const creatorSearch = document.getElementById('creator-search')
  
    function filterGamesByText(games) {
      const titleInput = titleSearch.value
      const creatorInput = creatorSearch.value
      const titleText = titleInput.toLowerCase()
      const creatorText = creatorInput.toLowerCase()
      const searchResults = games.filter((game) => {
        const gameTitle = game.querySelector('.title').textContent.toLowerCase()
        const gameCreator = game.querySelector('.creator').textContent.toLowerCase()
        return gameTitle.startsWith(titleText) && gameCreator.startsWith(creatorText)
      })
  
      sessionStorage.setItem('titleSearchText', titleInput)
      sessionStorage.setItem('creatorSearchText', creatorInput)
  
      return searchResults
    }
  
    // Load search text from sessionStorage
    function loadOptionsFromSessionStorage() {
      const titleSearchText = sessionStorage.getItem('titleSearchText')
      const creatorSearchText = sessionStorage.getItem('creatorSearchText')
      const mobilityFilter = sessionStorage.getItem('mobilityFilter')
      const difficultyFilter = sessionStorage.getItem('difficultyFilter')
      const timerStatusFilter = sessionStorage.getItem('timerStatusFilter')
      const timerDurationFilter = sessionStorage.getItem('timerDurationFilter')
      const datePostedFilter = sessionStorage.getItem('datePostedFilter')
  
      sortingSelect.value = sessionStorage.getItem('selectedOption')
  
      if (titleSearchText) {
        titleSearch.value = titleSearchText
      }
      if (creatorSearchText) {
        creatorSearch.value = creatorSearchText
      }
  
      if (mobilityFilter) {
        document.getElementById('mobility-select').value = mobilityFilter
      }
      if (difficultyFilter) {
        document.getElementById('difficulty-select').value = difficultyFilter
      }
      if (timerStatusFilter) {
        document.getElementById('timerstatus-select').value = timerStatusFilter
      }
      if (timerDurationFilter) {
        document.getElementById('duration-input').value = timerDurationFilter
      }
      if (datePostedFilter) {
        const datePostedFilters = document.getElementsByName('date-posted')
        datePostedFilters.forEach((radio) => {
          if (radio.value === datePostedFilter) {
            radio.checked = true
          }
        })
      }
    }
  
    function updateGames() {
      // Apply filters
      const filteredGames = applyFilters()
  
      // Filter games by text
      const searchedGames = filterGamesByText(filteredGames)
  
      // Sort the games
      const sortedGames = sortGames(searchedGames)
  
      // Clear the current games
      while (currentGames.firstChild) {
        currentGames.removeChild(currentGames.firstChild)
      }
  
      // Render the games in the new order for the current page
      const currentPage = parseInt(document.querySelector('.current-page').textContent.match(/\d+/)[0]) // Get the current page number
      const startIndex = (currentPage - 1) * gamesPerPage
      const endIndex = startIndex + gamesPerPage
      const gamesToRender = sortedGames.slice(startIndex, endIndex)
  
      // Show or hide the "No results..." message
      const noResultsMessage = document.getElementById('no-results')
      if (gamesToRender.length === 0) {
        noResultsMessage.style.display = 'block'
      } else {
        noResultsMessage.style.display = 'none'
      }
  
      gamesToRender.forEach((game) => {
        currentGames.appendChild(game)
      })
    }
  
    loadOptionsFromSessionStorage()
  
    sortingSelect.addEventListener('change', updateGames)
    applyFiltersBtn.addEventListener('click', updateGames)
    titleSearch.addEventListener('input', updateGames)
    creatorSearch.addEventListener('input', updateGames)
  
    updateGames()
  })