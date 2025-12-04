// scripts/discover.js
import { pointsOfInterest } from "../data/discover.mjs";

const grid = document.querySelector("#discover-grid");
const visitMessage = document.querySelector("#visit-message");

// ---------- render cards ----------
function renderCards() {
  if (!grid) return;

  pointsOfInterest.forEach((poi, index) => {
    const card = document.createElement("article");
    card.classList.add("discover-card", `discover-card-${index + 1}`);

    card.innerHTML = `
      <h3>${poi.name}</h3>
      <figure>
        <img src="${poi.image}" alt="${poi.alt}" loading="lazy" width="300" height="200">
        <figcaption class="visually-hidden">${poi.name}</figcaption>
      </figure>
      <address>${poi.address.replace(/\n/g, "<br>")}</address>
      <p>${poi.description}</p>
      <button type="button" class="learn-more-btn">Learn more</button>
    `;

    grid.appendChild(card);
  });
}

// ---------- visit message with localStorage ----------
function handleVisitMessage() {
  if (!visitMessage) return;

  const now = Date.now();
  const lastVisit = Number(localStorage.getItem("discoverLastVisit"));

  let message = "";

  if (!lastVisit) {
    message = "Welcome! Let us know if you have any questions.";
  } else {
    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const differenceInDays = Math.floor((now - lastVisit) / millisecondsInDay);

    if (differenceInDays < 1) {
      message = "Back so soon! Awesome!";
    } else if (differenceInDays === 1) {
      message = "You last visited 1 day ago.";
    } else {
      message = `You last visited ${differenceInDays} days ago.`;
    }
  }

  visitMessage.textContent = message;
  localStorage.setItem("discoverLastVisit", now.toString());
}

// ---------- init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderCards();
  handleVisitMessage();
});
