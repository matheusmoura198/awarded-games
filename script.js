const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.addEventListener("click", () => navLinks.classList.remove("open"));


// ===== 2. "LER MAIS" NOS CARDS =====
document.querySelectorAll(".btn-more").forEach((button) => {
    button.addEventListener("click", () => {
        const more = button.nextElementSibling;
        more.hidden = !more.hidden;
        button.textContent = more.hidden ? "Ler mais" : "Ler menos";
    });
});


// ===== 3. PESQUISA E FILTRO POR ANO =====
const searchInput = document.getElementById("search");
const yearFilter = document.getElementById("year-filter");
const noResults = document.getElementById("no-results");
const gameCards = document.querySelectorAll(".game-card");

// Preenche o select com os anos que existem nos cards
gameCards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.dataset.year;
    option.textContent = card.dataset.year;
    yearFilter.appendChild(option);
});

function filterGames() {
    const text = searchInput.value.toLowerCase();
    const year = yearFilter.value;
    let visible = 0;

    gameCards.forEach((card) => {
        const title = card.querySelector(".game-title").textContent.toLowerCase();
        const show = title.includes(text) && (year === "" || card.dataset.year === year);
        card.hidden = !show;
        if (show) visible++;
    });

    noResults.hidden = visible > 0;
}

searchInput.addEventListener("input", filterGames);
yearFilter.addEventListener("change", filterGames);


// ===== 4. SISTEMA DE VOTAÇÃO =====
// Candidatos (edite aqui). "votes" é o valor inicial (dados fictícios).
const candidates = [
    { id: "game1", name: "Candidato 1", votes: 12 },
    { id: "game2", name: "Candidato 2", votes: 9 },
    { id: "game3", name: "Candidato 3", votes: 7 },
    { id: "game4", name: "Candidato 4", votes: 4 }
];

const STORAGE_KEY = "gameAwardsVotes";
const voteGrid = document.getElementById("vote-grid");
const rankingList = document.getElementById("ranking");
const voteTotal = document.getElementById("vote-total");
const voteMessage = document.getElementById("vote-message");

// Carrega votos salvos no navegador (se existirem)
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
if (saved) {
    candidates.forEach((c) => { c.votes = saved[c.id] ?? c.votes; });
}

function saveVotes() {
    const data = {};
    candidates.forEach((c) => { data[c.id] = c.votes; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderVoting() {
    const total = candidates.reduce((sum, c) => sum + c.votes, 0);
    voteTotal.textContent = total;

    // Cards de votação
    voteGrid.innerHTML = "";
    candidates.forEach((c) => {
        const percent = total ? Math.round((c.votes / total) * 100) : 0;
        const card = document.createElement("article");
        card.className = "vote-card";
        card.innerHTML = `
            <h4>${c.name}</h4>
            <p class="vote-count">${c.votes} votos</p>
            <p class="vote-percent">${percent}%</p>
            <button class="btn" data-id="${c.id}">Votar</button>`;
        voteGrid.appendChild(card);
    });

    // Ranking ordenado do mais votado ao menos votado
    rankingList.innerHTML = "";
    [...candidates].sort((a, b) => b.votes - a.votes).forEach((c, index) => {
        const percent = total ? Math.round((c.votes / total) * 100) : 0;
        const item = document.createElement("li");
        item.className = "ranking-item";
        item.innerHTML = `
            <div class="ranking-info">
                <span>${index + 1}º ${c.name}</span>
                <span>${c.votes} (${percent}%)</span>
            </div>
            <div class="ranking-bar"><div class="ranking-fill" style="width:${percent}%"></div></div>`;
        rankingList.appendChild(item);
    });
}

// Um único "ouvinte" no grid cuida de todos os botões de voto
voteGrid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-id]");
    if (!button) return;

    if (sessionStorage.getItem("hasVoted")) {
        showMessage("Você já votou nesta visita. Obrigado!");
        return;
    }

    const candidate = candidates.find((c) => c.id === button.dataset.id);
    candidate.votes++;
    saveVotes();
    sessionStorage.setItem("hasVoted", "yes");
    renderVoting();
    showMessage(`✅ Voto registrado para ${candidate.name}!`);
});

document.getElementById("reset-votes").addEventListener("click", () => {
    candidates.forEach((c) => { c.votes = 0; });
    saveVotes();
    sessionStorage.removeItem("hasVoted");
    renderVoting();
    showMessage("Votos zerados.");
});

function showMessage(text) {
    voteMessage.textContent = text;
    voteMessage.hidden = false;
}

renderVoting();
              
