// =============================
// PEGAR NOME DA RAÇA PELA URL
// =============================
function getRaceFromURL() {
    const file = window.location.pathname.split("/").pop();
    return decodeURIComponent(file.replace(".html", "")).toLowerCase();
}

// =============================
// NORMALIZAR TEXTO
// =============================
function normalize(str = "") {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// =============================
// LIMPAR TEXTO (REMOVE TAGS D&D)
// =============================
function cleanText(text) {
    return text
        .replace(/\{@.*? (.*?)\}/g, "$1") // remove {@spell x} -> x
        .replace(/\{@.*?\}/g, "");        // fallback
}

// =============================
// FORMATAR ATRIBUTOS
// =============================
function formatAbilities(ability) {
  const names = {
    str: "Força",
    dex: "Destreza",
    con: "Constituição",
    int: "Inteligência",
    wis: "Sabedoria",
    cha: "Carisma"
  };

  let parts = [];

  // bônus fixos
  for (let key in ability) {
    if (key !== "choose") {
      parts.push(`+${ability[key]} ${names[key]}`);
    }
  }

  // escolha
  if (ability.choose) {
    const options = ability.choose.from
      .map(attr => names[attr])
      .join(" ou ");

    parts.push(`+${ability.choose.amount} ${options}`);
  }

  return parts.join(" e ");
}

// =============================
// FORMATAR SPEED
// =============================
function formatSpeed(speed) {
    if (!speed) return "-";

    if (typeof speed === "number") return `${speed} pés`;

    let parts = [];
    if (speed.walk) parts.push(`${speed.walk} pés`);
    if (speed.fly) parts.push(`Voo ${speed.fly} pés`);
    if (speed.swim) parts.push(`Nado ${speed.swim} pés`);

    return parts.join(" • ") || "-";
}

// =============================
// PEGAR DESCRIÇÃO DETALHADA
// =============================
function getDetailedDescription(entries = []) {
    const desc = entries.find(e =>
        normalize(e.name) === "descricao detalhada"
    );

    return desc
        ? desc.entries.map(cleanText).join("<br><br>")
        : null;
}

// =============================
// RENDER ENTRIES
// =============================
function renderEntries(entries = []) {
    const container = document.getElementById("race-entries");
    container.innerHTML = "";

    entries.forEach(entry => {
        if (!entry.entries) return;

        const name = normalize(entry.name);

        // ignorar blocos específicos
        if (
            name === "descricao detalhada" ||
            name === "descricao" ||
            name === "tracos raciais" ||
            name === "traco racial"
        ) return;

        const block = document.createElement("div");

        const content = entry.entries
            .map(e => cleanText(e))
            .join("<br><br>");

        block.innerHTML = `
            <div class="entry-title">${entry.name}</div>
            ${content}
        `;

        container.appendChild(block);
    });
}

// =============================
// RENDER SUBRAÇAS
// =============================
function renderSubraces(race) {
    const container = document.getElementById("subraces-container");

    if (!race.subraces || race.subraces.length === 0) {
        container.style.display = "none";
        return;
    }

    container.innerHTML = "";

    race.subraces.forEach(sub => {
        const div = document.createElement("div");
        div.classList.add("subrace");

        const content = (sub.entries || [])
            .map(e => `
                <div class="entry-title">${e.name}</div>
                ${(e.entries || []).map(cleanText).join("<br><br>")}
            `)
            .join("");

        div.innerHTML = `
            <div class="subrace-header">
                <span>${sub.name}</span>
                <span class="arrow">▶</span>
            </div>
            <div class="subrace-content">
                <div class="subrace-inner">
                    ${content}
                </div>
            </div>
        `;

        container.appendChild(div);
    });

    container.querySelectorAll(".subrace-header").forEach(header => {
        header.addEventListener("click", () => {
            header.parentElement.classList.toggle("open");
        });
    });
}

// =============================
// CARREGAR IMAGEM
// =============================
function setImage(name) {
    const img = document.getElementById("race-image");

    const fileName = normalize(name).replace(/\s+/g, "-");

    img.src = `../icons/${fileName}.png`;

    img.onerror = () => {
        img.src = "../icons/default.png";
    };
}

// =============================
// BUSCAR RAÇA
// =============================
function findRace(data, name) {
    return data.find(r =>
        normalize(r.name) === name ||
        normalize(r.english_name) === name
    );
}

// =============================
// FUNÇÃO PRINCIPAL
// =============================
async function loadRace() {
    const raceNameFromURL = getRaceFromURL();

    try {
        const response = await fetch("../data/racas.json");
        if (!response.ok) throw new Error("Erro ao carregar JSON");

        const json = await response.json();
        const data = Array.isArray(json) ? json : json.raca;

        const race = findRace(data, raceNameFromURL);

        if (!race) {
            document.body.innerHTML = "<h1>Raça não encontrada</h1>";
            return;
        }

        // =============================
        // INFO
        // =============================
        document.getElementById("race-name").textContent = race.name;
        document.title = `Raça - ${race.name}`;

        document.getElementById("race-source").textContent = race.source || "-";
        document.getElementById("race-size").textContent = race.size || "-";
        document.getElementById("race-speed").textContent = formatSpeed(race.speed);
        document.getElementById("race-ability").textContent = formatAbilities(race.ability);

        // =============================
        // DESCRIÇÃO (TOPO REAL)
        // =============================
        const desc = getDetailedDescription(race.entries);

        if (desc) {
            const descBlock = document.createElement("div");
            descBlock.classList.add("race-description");
            descBlock.innerHTML = desc;

            const header = document.querySelector(".race-divider");

            header.parentElement.insertBefore(descBlock, header.nextSibling);
        }

        // =============================
        // TRAÇOS
        // =============================
        renderEntries(race.entries);

        // =============================
        // SUBRAÇAS
        // =============================
        renderSubraces(race);

        // =============================
        // IMAGEM
        // =============================
        setImage(race.english_name);

        // =============================
        // ANIMAÇÃO
        // =============================
        setTimeout(() => {
            document.body.classList.add("loaded");
        }, 50);

    } catch (err) {
        console.error(err);
        document.body.innerHTML = "<h1>Erro ao carregar dados</h1>";
    }
}

// =============================
// INIT
// =============================
loadRace();