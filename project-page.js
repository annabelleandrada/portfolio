const projects = [
  { title: "CareerLinker", image: "images/careerlinker.jpg" },
  { title: "EduPredict", image: "images/edupredict.jpg" },
  { title: "VisVis Travel", image: "images/visvis-travel.jpg" },
  { title: "SafeChain Web App", image: "images/safechain.jpg" },
  { title: "SafeChain Responder App", image: "images/safechain-app.jpg" },
  { title: "Loan Track", image: "images/loantrack-logo.jpg" },
  { title: "Apartment Management System", image: "images/ams.jpg" },
  { title: "PO Tracker", image: "images/po-monitoring.jpg" },
  { title: "WSSCI — World Safety Supply Center", image: "images/wssci.jpg" }
];

const params = new URLSearchParams(window.location.search);
const rawIndex = Number.parseInt(params.get("id") || "0", 10);
const index = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < projects.length ? rawIndex : 0;
const project = projects[index];
const pad = value => String(value + 1).padStart(2, "0");

document.title = `${project.title} — Reference project preview`;
document.getElementById("projectIndex").textContent = `PROJECT ${pad(index)} · REFERENCE PREVIEW`;
document.getElementById("projectTitle").textContent = project.title;

const previous = (index - 1 + projects.length) % projects.length;
const next = (index + 1) % projects.length;
document.getElementById("previousProject").href = `project.html?id=${previous}`;
document.getElementById("nextProject").href = `project.html?id=${next}`;

// Keep project previews within the portfolio using local screenshots.
document.getElementById("destinationFrame").remove();
document.getElementById("repoFallback").hidden = false;
document.getElementById("repoImage").src = project.image;
document.getElementById("repoTitle").textContent = project.title;
