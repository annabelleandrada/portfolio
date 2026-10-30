const projects = [
  { title: "CareerLinker", url: "https://junieelll.github.io/careerlinker-demo/", image: "images/careerlinker.jpg", localizeName: true, scriptsToRebrand: ["js/data.js", "js/pages/profile.js", "js/router.js"] },
  { title: "EduPredict", url: "https://junieelll.github.io/edupredict-demo/", image: "images/edupredict.jpg", localizeName: true, scriptsToRebrand: ["js/data.js"] },
  { title: "VisVis Travel", url: "https://junieelll.github.io/visvis-travel-demo/", image: "images/visvis-travel.jpg" },
  { title: "SafeChain Web App", url: "https://junieelll.github.io/safechain/", image: "images/safechain.jpg" },
  { title: "SafeChain Responder App", url: "https://github.com/Junieelll/safechain-app", image: "images/safechain-app.jpg", repository: true },
  { title: "Loan Track", url: "https://github.com/Junieelll/LoanTrack", image: "images/loantrack-logo.jpg", repository: true },
  { title: "Apartment Management System", url: "https://junieelll.github.io/AMS/", image: "images/ams.jpg" },
  { title: "PO Tracker", url: "https://po-monitoring.vercel.app/", image: "images/po-monitoring.jpg" },
  { title: "WSSCI — World Safety Supply Center", url: "https://junieelll.github.io/wssci/", image: "images/wssci.jpg" }
];

const params = new URLSearchParams(window.location.search);
const rawIndex = Number.parseInt(params.get("id") || "0", 10);
const index = Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < projects.length ? rawIndex : 0;
const project = projects[index];
const pad = value => String(value + 1).padStart(2, "0");

document.title = `${project.title} — Reference project preview`;
document.getElementById("projectIndex").textContent = `PROJECT ${pad(index)} · REFERENCE PREVIEW`;
document.getElementById("projectTitle").textContent = project.title;
const externalLink = document.getElementById("openExternal");
externalLink.href = project.url;

const previous = (index - 1 + projects.length) % projects.length;
const next = (index + 1) % projects.length;
document.getElementById("previousProject").href = `project.html?id=${previous}`;
document.getElementById("nextProject").href = `project.html?id=${next}`;

if (project.repository) {
  const frame = document.getElementById("destinationFrame");
  frame.remove();
  const fallback = document.getElementById("repoFallback");
  fallback.hidden = false;
  document.getElementById("repoImage").src = project.image;
  document.getElementById("repoTitle").textContent = project.title;
  document.getElementById("openExternal").hidden = true;
  document.getElementById("repoButton").hidden = true;
} else {
  const frame = document.getElementById("destinationFrame");
  if (project.localizeName) {
    async function loadBrandedPreview() {
      const response = await fetch(project.url);
      if (!response.ok) throw new Error("Could not load the project preview.");
      const html = await response.text();
      const previewDocument = new DOMParser().parseFromString(html, "text/html");
      const base = previewDocument.createElement("base");
      base.href = project.url;
      previewDocument.head.prepend(base);

      const assetsToRebrand = new Set(project.scriptsToRebrand);
      for (const script of [...previewDocument.scripts]) {
        const source = script.getAttribute("src");
        if (!source) continue;
        const assetUrl = new URL(source, project.url);
        if (![...assetsToRebrand].some(path => assetUrl.pathname.endsWith(path))) continue;

        const assetResponse = await fetch(assetUrl);
        if (!assetResponse.ok) throw new Error(`Could not load ${assetUrl.pathname}.`);
        let assetSource = await assetResponse.text();
        assetSource = assetSource
          .replaceAll("Juniel Cardenas", "Annabelle Andrada")
          .replaceAll("Juniel Santos", "Annabelle Andrada")
          .replaceAll("juniel.cardenas@edu.ph", "annabelleandrada08@gmail.com")
          .replaceAll("cardenas.juniel.permito@gmail.com", "annabelleandrada08@gmail.com")
          .replaceAll("Hi Juniel!", "Hi Annabelle!")
          .replaceAll("Juniel", "Annabelle")
          .replaceAll("Cardenas", "Andrada")
          .replaceAll("'JC'", "'AA'")
          .replaceAll('"JC"', '"AA"')
          .replace(/<\/script/gi, "<\\/script");
        script.removeAttribute("src");
        script.textContent = assetSource;
      }

      frame.setAttribute("sandbox", "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox");
      frame.srcdoc = `<!doctype html>${previewDocument.documentElement.outerHTML}`;
    }
    document.getElementById("openExternal").hidden = true;
    loadBrandedPreview().catch(() => {
      frame.remove();
      document.getElementById("openExternal").hidden = true;
      const fallback = document.getElementById("repoFallback");
      fallback.hidden = false;
      document.getElementById("repoImage").src = project.image;
      document.getElementById("repoTitle").textContent = project.title;
    });
  } else {
    frame.src = project.url;
  }
}
