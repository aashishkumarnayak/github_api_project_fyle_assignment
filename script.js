let repositoriesPerPage = 10;
let currentPage = 1;

async function searchUser() {
    var username = document.getElementById('usernameInput').value.trim();

    if (username !== "") {
        try {
            // Fetch user data from GitHub API
            const userDataResponse = await fetch(`https://api.github.com/users/${username}`);

            if (userDataResponse.status === 404) {
                // User not found
                displayUserNotFound();
                return;
            }

            const userData = await userDataResponse.json();

            // Display user data
            displayUserData(userData);

            // Fetch user repositories
            const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
            const repos = await reposResponse.json();

            // Display user repositories
            displayRepositories(repos);

            // Display pagination
            displayPagination(repos);
        } catch (error) {
            displayError("Error fetching data");
        }
    } else {
        displayError("Please enter a username");
    }
}


function displayUserData(user) {
    var resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = `
        <div class="user-profile">
            
            <img src="${user.avatar_url}" alt="${user.login}" width="100">
            
            
            <div class="user-data">
                <h2>${user.login}</h2>
                <p>${user.name ? `Name: ${user.name}` : 'Name not available'}</p>
                <p>${user.bio ? `Bio: ${user.bio}` : 'Bio not available'}</p>
                <div style="display: flex;">
                <i class='fa fa-map-marker' style='font-size:24px'></i> 
                <p>${user.location ? `${user.location}` : 'Location not available'}</p>
                </div>
                <p>${user.blog ? `Social Link: ${user.blog}` : 'Social link not available'}</p>
                <div style="display: flex;">
                <i class='fa fa-link' style='font-size:24px'></i> 
                <p><a href="${user.html_url}" target="_blank">${user.html_url}</a></p>
                </div>
                
            </div>
        </div>
    `;
    resultContainer.innerHTML += '<h3>Repositories</h3>';
}

async function displayRepositories(repos) {
    var resultContainer = document.getElementById('resultContainer_repo');

    if (repos.length > 0) {
        for (let i = 0; i < repos.length; i += 2) {
            resultContainer.innerHTML += '<div class="col-md-6">' + await createRepoCard(repos[i]) + '</div>';

            if (i + 1 < repos.length) {
                resultContainer.innerHTML += '<div class="col-md-6">' + await createRepoCard(repos[i + 1]) + '</div>';
            }
        }
    } else {
        resultContainer.innerHTML += '<p>No repositories found</p>';
    }
}


async function createRepoCard(repo) {
    const languages = await getLanguages(repo.languages_url);

    const displayedLanguages = languages.slice(0, 4);
    const remainingLanguages = languages.slice(4);

    const languagesHtml = displayedLanguages.map(language => `<span class="lang">${language}</span>`).join(' ');

    return `
        <div class="col-md-6">
            <div class="repo">
                <p class="repo_name"><strong>${repo.name}</strong></p>
                <p>${repo.description || 'No description available'}</p>
                <div class="languages">${languagesHtml.length > 0 ? languagesHtml : 'Languages not available'}
                ${remainingLanguages.length > 0 ? `<p class="more-languages">+${remainingLanguages.length}</p>` : ''} </div>
    
            </div>
        </div>
    `;
}




async function getLanguages(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return Object.keys(data);
    } catch (error) {
        console.error('Error fetching languages:', error);
        return [];
    }
}


function displayPagination(repos) {
    var paginationContainer = document.getElementById('paginationContainer');
    var paginationList = document.getElementById('paginationList');
    
    // Clear previous pagination
    paginationList.innerHTML = '';

    const totalPages = Math.ceil(repos.length / repositoriesPerPage);

    if (totalPages > 1) {
        paginationContainer.style.display = 'block'; // Show pagination container

        paginationList.innerHTML += `<li class="page-item previous disabled">
            <button class="page-link" onclick="changePage(currentPage - 1)" aria-label="Previous">
                <span aria-hidden="true">&laquo; Previous</span>
            </button>
        </li>`;

        for (let i = 1; i <= totalPages; i++) {
            paginationList.innerHTML += `<li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>`;
        }

        paginationList.innerHTML += `<li class="page-item next ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" onclick="changePage(currentPage + 1)" aria-label="Next">
                <span aria-hidden="true">Next &raquo;</span>
            </button>
        </li>`;
    } else {
        paginationContainer.style.display = 'none'; // Hide pagination container if there is only one page
    }
}

function changePage(page) {
    currentPage = page;
    searchUser();
}

function changePerPage() {
    var perPageInput = document.getElementById('perPageInput');
    var perPageValue = parseInt(perPageInput.value, 10);

    if (!isNaN(perPageValue) && perPageValue > 0 && perPageValue <= 100) {
        repositoriesPerPage = perPageValue;
        currentPage = 1;
        searchUser();
    } else {
        displayError("Please enter a valid number between 1 and 100");
    }
}

function displayError(message) {
    var resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = `<p style="color: red;">${message}</p>`;
}
