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

    // REMOVED the resetBtn logic here. Just hide generateBtn if empty.
    if (deck.length === 0) {
      generateBtn.hidden = true;
    } else {
      generateBtn.hidden = false;
    }
  } else {
    // First time visiting or storage cleared
    deck = shuffledDeck();
    generatedCount = 0;
    drawnItems = [];
  }
  updateCounter();
}