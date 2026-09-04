// We declare combinedLinks as an empty array first.
let combinedLinks = [];

// Turn a PDF url into a readable topic name
function topicNameFromUrl(url) {
  const file = url.split("/").pop().replace(/\.pdf$/i, "");
  return file
    .replace(/-(NC-)?S25b?$/i, "")
    .replace(/-ANSb?$/i, "")
    .replace(/-/g, " ");
}

// Fisher–Yates shuffle
function shuffledDeck() {
  const deck = [...combinedLinks];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// DOM Elements
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const cardEl = document.getElementById("card");
const counterEl = document.getElementById("counter");
const dial = document.getElementById("dial");
const dialCount = document.getElementById("dialCount");
const historyList = document.getElementById("historyList");
const modalOverlay = document.getElementById("modalOverlay");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

// State variables
let deck = [];
let generatedCount = 0;
let drawnItems = [];

const STORAGE_KEY = "pastPaperPenguinState";

function saveState() {
  const state = {
    deck: deck,
    generatedCount: generatedCount,
    drawnItems: drawnItems
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const state = JSON.parse(saved);
    deck = state.deck;
    generatedCount = state.generatedCount;
    drawnItems = state.drawnItems || [];

    // Rebuild History UI
    historyList.innerHTML = "";
    drawnItems.forEach((pair, index) => {
      const topic = topicNameFromUrl(pair.question);
      const li = document.createElement("li");
      const serial = String(index + 1).padStart(3, "0");
      li.innerHTML = `<span class="no">#${serial}</span><span class="history-links"><a href="${pair.question}" target="_blank" rel="noopener noreferrer">${topic}</a> · <a href="${pair.answer}" target="_blank" rel="noopener noreferrer">Answers</a></span>`;
      historyList.prepend(li);
    });

    // Rebuild Card UI if there are drawn items
    if (drawnItems.length > 0) {
      const lastPair = drawnItems[drawnItems.length - 1];
      const topic = topicNameFromUrl(lastPair.question);
      cardEl.dataset.empty = "false";
      cardEl.innerHTML = `
        <p class="card__serial">TOPIC ${String(generatedCount).padStart(3, "0")}</p>
        <p class="card__topic">${topic}</p>
        <div class="card__links">
          <a class="card__open" href="${lastPair.question}" target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
          <a class="card__open card__open--answers" href="${lastPair.answer}" target="_blank" rel="noopener noreferrer">Open Answers ↗</a>
        </div>
      `;
    }

    if (deck.length === 0) {
      generateBtn.hidden = true;
      resetBtn.hidden = false;
    }
  } else {
    // First time visiting or storage cleared
    deck = shuffledDeck();
    generatedCount = 0;
    drawnItems = [];
  }
  updateCounter();
}

function updateCounter() {
  const remaining = deck.length;
  dialCount.textContent = remaining;
  counterEl.textContent =
    remaining > 0
      ? `${remaining} topic${remaining === 1 ? "" : "s"} remaining`
      : "All topics generated";
}

function generateTopic() {
  if (deck.length === 0) return;

  dial.classList.remove("spin");
  void dial.offsetWidth;
  dial.classList.add("spin");

  const pair = deck.pop();
  generatedCount += 1;
  drawnItems.push(pair);
  
  saveState();

  const topic = topicNameFromUrl(pair.question);

  cardEl.dataset.empty = "false";
  cardEl.classList.remove("card--drawn");
  void cardEl.offsetWidth;
  cardEl.classList.add("card--drawn");
  cardEl.innerHTML = `
    <p class="card__serial">TOPIC ${String(generatedCount).padStart(3, "0")}</p>
    <p class="card__topic">${topic}</p>
    <div class="card__links">
      <a class="card__open" href="${pair.question}" target="_blank" rel="noopener noreferrer">Open PDF ↗</a>
      <a class="card__open card__open--answers" href="${pair.answer}" target="_blank" rel="noopener noreferrer">Open Answers ↗</a>
    </div>
  `;

  const li = document.createElement("li");
  li.innerHTML = `<span class="no">#${String(generatedCount).padStart(3, "0")}</span><span class="history-links"><a href="${pair.question}" target="_blank" rel="noopener noreferrer">${topic}</a> · <a href="${pair.answer}" target="_blank" rel="noopener noreferrer">Answers</a></span>`;
  historyList.prepend(li);

  updateCounter();

  if (deck.length === 0) {
    generateBtn.hidden = true;
    resetBtn.hidden = false;
  }
}

function openResetModal() {
  modalOverlay.hidden = false;
  modalConfirm.focus();
}

function closeResetModal() {
  modalOverlay.hidden = true;
  resetBtn.focus();
}

function performReset() {
  deck = shuffledDeck();
  generatedCount = 0;
  drawnItems = [];
  
  saveState();

  historyList.innerHTML = "";
  cardEl.dataset.empty = "true";
  cardEl.classList.remove("card--drawn");
  cardEl.innerHTML = `<p class="card__hint">Press generate to get your first topic</p>`;
  generateBtn.hidden = false;
  resetBtn.hidden = true;
  updateCounter();
  closeResetModal();
}

generateBtn.addEventListener("click", generateTopic);
resetBtn.addEventListener("click", openResetModal);
modalCancel.addEventListener("click", closeResetModal);
modalConfirm.addEventListener("click", performReset);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeResetModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeResetModal();
});


// --- NEW: Fetch JSON and initialize ---
async function initApp() {
  try {
    // Replace 'links.json' with the actual path to your file
    const response = await fetch('links.json');
    if (!response.ok) throw new Error("Network response was not ok");
    
    // Parse the JSON data into our global array
    combinedLinks = await response.json();
    
    // Now that we have the data, we can safely load state and start the app
    loadState();
    
  } catch (error) {
    console.error("Error loading links data:", error);
    cardEl.innerHTML = `<p class="card__hint" style="color: red;">Failed to load topics. Please check your connection or file path.</p>`;
  }
}

// Start the initialization process
initApp();