const main = document.getElementById("main-content");
const searchInput = document.getElementById("searchInput");

const sectionTemplate = document.getElementById("section-template");
const cardTemplate = document.getElementById("card-template");

let allRaces = [];
let groupedRaces = {};

/* =========================
   FETCH JSON
========================= */
async function loadRaces(){
    try{
        const response = await fetch("data/racas.json");
        const data = await response.json();

        // agora vem de data.raca
        allRaces = data.raca || [];

        groupByBook(allRaces);
        renderSections(groupedRaces);

    }catch(err){
        console.error("Erro ao carregar JSON:", err);
    }
}

/* =========================
   AGRUPAR POR LIVRO
========================= */
function groupByBook(races){
    groupedRaces = {};

    races.forEach(race => {
        const book = race.source || "Outros";

        if(!groupedRaces[book]){
            groupedRaces[book] = [];
        }

        groupedRaces[book].push(race);
    });
}

/* =========================
   RENDER SECTIONS
========================= */
function renderSections(groups){
    main.innerHTML = "";

    Object.keys(groups).forEach(book => {
        const sectionClone = sectionTemplate.content.cloneNode(true);

        const section = sectionClone.querySelector(".book-section");
        const header = sectionClone.querySelector(".section-header");
        const bookName = sectionClone.querySelector(".book-name");
        const bookIcon = sectionClone.querySelector(".book-icon");
        const container = sectionClone.querySelector(".cards-container");

        // nome do livro
        bookName.textContent = book;

        // gerar nome do arquivo
        const bookFile = book
            .toLowerCase()
            .replace(/['"]/g, "") 
            .replace(/[^a-z0-9]+/g, "_");

        // seta imagem
        bookIcon.src = `./icons/books/${bookFile}.png`;

        // fallback
        bookIcon.onerror = () => {
            bookIcon.src = "./icons/books/default.png";
        };

        header.addEventListener("click", () => {
            section.classList.toggle("closed");
        });

        groups[book].forEach(race => {
            const card = createCard(race);
            container.appendChild(card);
        });

        main.appendChild(sectionClone);
    });
}

/* =========================
   EXTRAIR DADOS DO JSON
========================= */
function getEntry(race, entryName){
    const entry = race.entries?.find(e => e.name === entryName);
    if(!entry) return "";

    // junta textos internos
    return entry.entries?.join(" ") || "";
}

/* =========================
   CRIAR CARD
========================= */
function createCard(race){
    const cardClone = cardTemplate.content.cloneNode(true);

    const card = cardClone.querySelector(".race-card");
    const img = cardClone.querySelector("img");
    const name = cardClone.querySelector(".race-name");
    const book = cardClone.querySelector(".race-book");
    const desc = cardClone.querySelector(".race-description");
    const traits = cardClone.querySelector(".race-traits");

    // Nome
    name.textContent = race.name || "Sem nome";

    // Livro
    book.textContent = race.source || "";

    // Descrição
    let description = getEntry(race, "Descrição") 
                   || getEntry(race, "Descrição Detalhada");

    desc.textContent = description;

    // Traços raciais
    let racialTraits = getEntry(race, "Traços Raciais");

    if(racialTraits){
        traits.innerHTML = `<strong>Traços:</strong><br>${racialTraits}`;
    }else{
        traits.innerHTML = "";
    }

    // Imagem 
    const slug = race.name.toLowerCase().replace(/\s+/g, "-");
    const fileName = (race.english_name || race.name)
        .toLowerCase()
        .replace(/\s+/g, "_");

    img.src = `./icons/icons-card/${fileName}.png`;

    img.onerror = () => {
        img.src = "assets/placeholder.png";
    };

    // Clique -> página dedicada
    card.onclick = () => {
        const fileName = (race.english_name || race.name)
            .toLowerCase()
            .replace(/\s+/g, "_");

        window.location.href = `pages/${fileName}.html`;
    };

    return card;
}

/* =========================
   BUSCA (PT + EN)
========================= */
searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();

    const filtered = allRaces.filter(race => {
        const name = (race.name || "").toLowerCase();
        const en = (race.english_name || "").toLowerCase();

        return name.includes(term) || en.includes(term);
    });

    groupByBook(filtered);
    renderSections(groupedRaces);
});

/* =========================
   HOME
========================= */
function goHome(){
    searchInput.value = "";
    groupByBook(allRaces);
    renderSections(groupedRaces);
}


setTimeout(() => {
    document.body.classList.add("loaded");
}, 50);

loadRaces();