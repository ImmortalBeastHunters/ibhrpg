/* =============================
CONFIG
============================= */

const SPELLS_URL = "data/spells.json"
const ICON_PATH = "icons/"

/* =============================
STATE
============================= */

let spells = []
let knownSpells = new Set()

let selections = {}
let activeSelection = null

let showKnownOnly = false
let deleteMode = false

/* =============================
ELEMENTS
============================= */

const container = document.getElementById("spellContainer")
const searchInput = document.getElementById("searchInput")
const classFilter = document.getElementById("classFilter")
const knownOnlyBtn = document.getElementById("knownOnlyButton")

const spellTemplate = document.getElementById("spellCardTemplate")
const levelTemplate = document.getElementById("levelTemplate")

const modal = document.getElementById("spellModal")
const modalBody = document.getElementById("modalBody")

const sidebar = document.getElementById("sidebar")
const sidebarToggle = document.getElementById("sidebarToggle")

const saveSelectionBtn = document.getElementById("saveSelectionBtn")
const noSelectionBtn = document.getElementById("noSelectionBtn")

const selectionList = document.getElementById("selectionList")

const exportBtn = document.getElementById("exportSelection")
const importBtn = document.getElementById("importSelection")
const deleteBtn = document.getElementById("deleteSelectionMode")

const importFile = document.getElementById("importFile")

const saveModal = document.getElementById("saveModal")
const selectionNameInput = document.getElementById("selectionNameInput")
const confirmSaveSelection = document.getElementById("confirmSaveSelection")

/* =============================
INIT
============================= */

init()

async function init(){

await loadSpells()

loadSelections()

render()

bindEvents()

document.querySelector(".cancel-btn").onclick = () => {
saveModal.classList.add("hidden")
}

modal.querySelector(".modal-overlay").onclick = closeModal

document.body.classList.add("loaded")

document.addEventListener("click",(e)=>{

const clickedInsideSidebar = sidebar.contains(e.target)
const clickedToggle = sidebarToggle.contains(e.target)
const clickedModal = saveModal.contains(e.target)

if(sidebar.classList.contains("open") &&
   !clickedInsideSidebar &&
   !clickedToggle &&
   !clickedModal){

sidebar.classList.remove("open")

e.stopPropagation()
e.preventDefault()

}

}, true)

selectionNameInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

confirmSaveSelection.click()

}

})

}

/* =============================
LOAD SPELLS
============================= */

async function loadSpells(){

const res = await fetch(SPELLS_URL)

spells = await res.json()

}

/* =============================
RENDER
============================= */

function render(){

container.innerHTML=""

for(let level=0; level<=9; level++){

const levelSpells = spells
  .filter(s => s.level === level)
  .filter(filterSpell) 

if (levelSpells.length === 0) continue

const levelNode = levelTemplate.content.cloneNode(true)

const section = levelNode.querySelector(".spell-level")
const title = levelNode.querySelector(".level-title")
const grid = levelNode.querySelector(".level-spells")

title.textContent = level===0 ? "Truques" : `Nível ${level}`

grid.innerHTML=""

levelSpells
.filter(filterSpell)
.forEach(spell=>{

const card = createCard(spell)

grid.appendChild(card)

})

levelNode.querySelector(".level-header").onclick=()=>{

section.classList.toggle("collapsed")

}

container.appendChild(levelNode)

}

renderSelections()

lucide.createIcons()

}

/* =============================
FILTER
============================= */

function filterSpell(spell){

const search = searchInput.value.toLowerCase()

if(search){

const matchPT = spell.name.toLowerCase().includes(search)
const matchEN = spell.originalName.toLowerCase().includes(search)

if(!matchPT && !matchEN) return false

}

const classValue = classFilter.value

if(classValue!=="all"){

if(!spell.classes.includes(classValue)) return false

}

if(showKnownOnly){

if(!knownSpells.has(spell.name)) return false

}

return true

}

/* =============================
CREATE CARD
============================= */

function createCard(spell){

const node = spellTemplate.content.cloneNode(true)

const card = node.querySelector(".spell-card")

const icon = node.querySelector(".spell-icon")
const name = node.querySelector(".spell-name")
const original = node.querySelector(".spell-original")
const meta = node.querySelector(".spell-meta")

const casting = node.querySelector(".spell-casting")
const range = node.querySelector(".spell-range")
const duration = node.querySelector(".spell-duration")
const components = node.querySelector(".spell-components")

const desc = node.querySelector(".spell-description")

const knownBtn = node.querySelector(".known-button")

/* ICON */

const iconName = spell.originalName
.toLowerCase()
.replaceAll(" ","-")

icon.loading = "lazy"
icon.src = ICON_PATH + iconName + ".png"

/* TEXT */

name.textContent = spell.name
original.textContent = spell.originalName

meta.textContent = `${capitalize(spell.school)} • Nível ${spell.level}`

casting.textContent = `Tempo: ${spell.casting.time} ${spell.casting.unit}`

range.textContent = `Distância: ${spell.range.value || ""} ${spell.range.unit}`

duration.textContent =
`Duração: ${spell.duration.value || ""} ${spell.duration.unit}`

components.textContent =
`Componentes: ${
spell.components.isVerbal ? "V " : ""
}${
spell.components.isSomatic ? "S " : ""
}${
spell.components.isMaterial ? "M" : ""
}`

desc.textContent = spell.body.description[0].description

/* KNOWN */

updateKnownButton(knownBtn,spell)

knownBtn.onclick=(e)=>{

e.stopPropagation()

toggleKnown(spell.name)

updateKnownButton(knownBtn,spell)

if(activeSelection) updateActiveSelection()

}

/* MODAL */

card.onclick=()=>openSpellModal(spell)

return card

}

/* =============================
MODAL
============================= */

function openSpellModal(spell){

modal.classList.remove("hidden")
modalBody.innerHTML=""

/* ICON */

const iconName = spell.originalName
.toLowerCase()
.replaceAll(" ","-")

const icon = ICON_PATH + iconName + ".png"

/* COMPONENTES */

const components = [
spell.components.isVerbal ? "V" : "",
spell.components.isSomatic ? "S" : "",
spell.components.isMaterial ? "M" : ""
].filter(Boolean).join(" ")

/* CLASSES */

const classesHTML = spell.classes
.map(c=>`<div class="tag">${capitalize(c)}</div>`)
.join("")

/* DESCRIÇÃO */

let descriptionHTML=""

spell.body.description.forEach(item=>{

if(item.type==="default"){
descriptionHTML+=`<p>${item.description}</p>`
}

if(item.type==="option"){
descriptionHTML+=`
<div class="option">
<div class="option-title">${item.value}</div>
<div>${item.description}</div>
</div>
`
}

})

/* NÍVEIS SUPERIORES */

let higherLevelsHTML=""

if(spell.body.higherLevels){

higherLevelsHTML=`
<div class="section-title">Níveis Superiores</div>
<p>${spell.body.higherLevels}</p>
`

}

/* RITUAL */

const ritualText = spell.isRitual ? " • Ritual" : ""

/* HTML */

modalBody.innerHTML=`

<button class="modal-close">✖</button>

<div class="spell-header-large">

<img class="spell-icon-large" src="${icon}">

<div class="spell-title-container">

<div class="spell-name">${spell.name}</div>

<div class="spell-original">${spell.originalName}</div>

<div class="spell-meta">
${capitalize(spell.school)} • Nível ${spell.level}${ritualText}
</div>

</div>

</div>

<hr class="spell-divider">

<div class="spell-info-large">

<div>
<b>Tempo:</b><br>
${spell.casting.time} ${spell.casting.unit}
</div>

<div>
<b>Distância:</b><br>
${spell.range.value ?? ""} ${spell.range.unit}
</div>

<div>
<b>Duração:</b><br>
${spell.duration.value ?? ""} ${spell.duration.unit}
</div>

<div>
<b>Componentes:</b><br>
${components}
</div>

<div>
<b>Concentração:</b><br>
${spell.duration.concentration ? "Sim" : "Não"}
</div>

</div>

</div>

<div class="section-title">Classes</div>

<div class="tags">
${classesHTML}
</div>

<div class="section-title">Descrição</div>

<div class="description">
${descriptionHTML}
</div>

${higherLevelsHTML}

<div class="footer">
Fonte: ${spell.font?.reference ?? ""} • Página ${spell.font?.page ?? ""}
</div>

`

/* BOTÃO X */

modalBody.querySelector(".modal-close").onclick = closeModal
}

function closeModal(){

modal.classList.add("closing")

setTimeout(()=>{

modal.classList.remove("closing")
modal.classList.add("hidden")

},180)

saveModal.classList.add("hidden")

}

/* =============================
KNOWN SPELLS
============================= */

function toggleKnown(name){

if(knownSpells.has(name)) knownSpells.delete(name)
else knownSpells.add(name)

}

function updateKnownButton(btn,spell){

if(knownSpells.has(spell.name)){

btn.style.background="#2563eb"

}else{

btn.style.background="#1f2937"

}

}

/* =============================
SEARCH / FILTER EVENTS
============================= */

function bindEvents(){

searchInput.oninput=render

classFilter.onchange=render

knownOnlyBtn.onclick = () => {

  showKnownOnly = !showKnownOnly

  knownOnlyBtn.classList.toggle("active", showKnownOnly)

  render()

}

sidebarToggle.onclick=()=>{

sidebar.classList.toggle("open")

}

/* SAVE SELECTION */

saveSelectionBtn.onclick=()=>{

saveModal.classList.remove("hidden")

}

confirmSaveSelection.onclick=()=>{

const name = selectionNameInput.value.trim()

if(!name) return

selections[name]=[...knownSpells]

activeSelection=name

saveSelections()

saveModal.classList.add("hidden")

renderSelections()

}

/* NO SELECTION */

noSelectionBtn.onclick=()=>{

activeSelection=null

knownSpells.clear()

render()

}

/* EXPORT */

exportBtn.onclick=()=>{

if(!activeSelection){

alert("Selecione uma seleção para exportar")

return

}

const data = {

name:activeSelection,

spells:[...knownSpells]

}

const blob = new Blob([JSON.stringify(data)],{type:"application/json"})

const a = document.createElement("a")

a.href=URL.createObjectURL(blob)

a.download=`GDM_${activeSelection}.json`

a.click()

}

/* IMPORT */

importBtn.onclick=()=>{

importFile.click()

}

importFile.onchange = (e)=>{

const file = e.target.files[0]

if(!file) return

const reader = new FileReader()

reader.onload = ()=>{

try{

const data = JSON.parse(reader.result)

/* validação */

if(!data.name || !Array.isArray(data.spells)){

alert("Arquivo inválido")
return

}

/* adiciona seleção */

selections[data.name] = data.spells
activeSelection = data.name
knownSpells = new Set(data.spells)

saveSelections()

render()

alert("Seleção importada!")

}catch(err){

alert("Erro ao importar arquivo")

}

}

/* lê arquivo */

reader.readAsText(file)

/* limpa input para permitir importar novamente */

importFile.value=""

}

/* DELETE MODE */

deleteBtn.onclick=()=>{

deleteMode=!deleteMode

document.querySelectorAll(".selection-item").forEach(el=>{

if(deleteMode) el.classList.add("deleting")
else el.classList.remove("deleting")

})

}

}

/* =============================
SELECTIONS
============================= */

function renderSelections(){

selectionList.innerHTML=""

Object.keys(selections).forEach(name=>{

const div=document.createElement("div")

div.className="selection-item"

if(name===activeSelection) div.classList.add("active")

div.innerHTML = `
<i data-tabler-icon="bookmark"></i>
<span>${name}</span>
`

div.onclick=()=>{

if(deleteMode){

if(confirm("Apagar seleção?")){

delete selections[name]

saveSelections()

renderSelections()

}

return

}

activeSelection=name

knownSpells=new Set(selections[name])

render()

}

selectionList.appendChild(div)

})

}

function updateActiveSelection(){

if(!activeSelection) return

selections[activeSelection]=[...knownSpells]

saveSelections()

}

/* =============================
LOCAL STORAGE
============================= */

function saveSelections(){

localStorage.setItem("gdmSelections",JSON.stringify(selections))

}

function loadSelections(){

const saved = localStorage.getItem("gdmSelections")

if(saved) selections = JSON.parse(saved)

}

/* =============================
UTILS
============================= */

function capitalize(str){

return str.charAt(0).toUpperCase()+str.slice(1)

}
