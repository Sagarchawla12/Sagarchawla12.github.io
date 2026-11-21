const motion = matchMedia("(prefers-reduced-motion: reduce)");
const colourButton = document.querySelector("#colour-motion");
colourButton.hidden = false;
colourButton.addEventListener("click", () => {
  const paused = document.body.toggleAttribute("data-colour-paused");
  colourButton.textContent = paused ? "Resume colours" : "Pause colours";
});
const projectGrid = document.querySelector("#project-grid");
const dialog = document.querySelector("#case-study");
const caseContent = document.querySelector("#case-content");
const header = document.querySelector(".header");
const readingProgress = header.querySelector(".reading-progress");
const navigation = [...header.querySelectorAll("nav a")].map(link => ({
  link,
  section: document.querySelector(link.hash),
}));
let navigationFrame;
let currentLink;

function updateNavigation() {
  navigationFrame = undefined;
  const pageHeight = document.documentElement.scrollHeight - innerHeight;
  const progress = pageHeight > 0 ? Math.min(1, Math.max(0, scrollY / pageHeight)) : 0;
  readingProgress.style.setProperty("--progress", progress);
  const marker = header.offsetHeight + 48;
  const current = progress > .99
    ? navigation.at(-1)
    : navigation.findLast(({ section }) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= marker && bounds.bottom > marker;
    });
  if (current?.link === currentLink) return;
  currentLink?.removeAttribute("aria-current");
  currentLink = current?.link;
  currentLink?.setAttribute("aria-current", "location");
}

function queueNavigation() {
  if (navigationFrame === undefined) navigationFrame = requestAnimationFrame(updateNavigation);
}

window.addEventListener("scroll", queueNavigation, { passive: true });
window.addEventListener("resize", queueNavigation);
new ResizeObserver(queueNavigation).observe(document.querySelector("main"));
queueNavigation();
const missionPhases = [
  { label: "Takeoff", point: [.15, .91], note: "Models thrust and speed throughout the takeoff roll." },
  { label: "Climb", point: [.3, .29], note: "Estimates time and fuel by altitude segment and updates aircraft mass." },
  { label: "Cruise", point: [.59, .19], note: "Integrates fuel burn at the chosen Mach number and altitude." },
  { label: "Descent", point: [.77, .59], note: "Tracks altitude, fuel burn and mass during the descent." },
  { label: "Landing", point: [.93, .9], note: "Compares landing-distance sensitivity to runway friction and slope." }
];

function fitCanvas(canvas) {
  const { width, height } = canvas.getBoundingClientRect();
  if (!width || !height) return null;
  const density = Math.min(devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * density);
  const pixelHeight = Math.round(height * density);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const context = canvas.getContext("2d");
  context.setTransform(density, 0, 0, density, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width, height };
}

function stroke(context, points, color, lineWidth = 1, closed = false) {
  context.beginPath();
  points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
  if (closed) context.closePath();
  context.strokeStyle = color;
  context.lineWidth = lineWidth;
  context.stroke();
}

function circle(context, x, y, radius, color) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}

const aircraftPlanform = document.querySelector("#aircraft-planform");

function drawAircraftPlanform() {
  const surface = fitCanvas(aircraftPlanform);
  if (!surface) return;
  const { context, width, height } = surface;
  const scale = Math.min(width / 440, height / 164);
  context.save();
  context.translate((width - 440 * scale) / 2, (height - 164 * scale) / 2);
  context.scale(scale, scale);

  context.setLineDash([5, 6]);
  stroke(context, [[13, 82], [427, 82]], "#b2bbf081");
  context.setLineDash([]);

  const contour = [[155, 68], [238, 15], [260, 15], [224, 68], [345, 71], [380, 44], [394, 44], [383, 73], [410, 77]];
  const hull = context.createLinearGradient(40, 23, 410, 141);
  hull.addColorStop(0, "#cec5ff");
  hull.addColorStop(.55, "#9fdaee");
  hull.addColorStop(1, "#a5f6d9");
  context.beginPath();
  context.moveTo(40, 82);
  context.quadraticCurveTo(52, 68, 81, 68);
  contour.forEach(([x, y]) => context.lineTo(x, y));
  context.quadraticCurveTo(424, 82, 410, 87);
  contour.slice(0, -1).reverse().forEach(([x, y]) => context.lineTo(x, 164 - y));
  context.lineTo(81, 96);
  context.quadraticCurveTo(52, 96, 40, 82);
  context.closePath();
  context.fillStyle = hull;
  context.fill();
  context.strokeStyle = "#f5f7ff";
  context.lineWidth = 1.15;
  context.stroke();

  for (const y of [47, 117]) {
    context.beginPath();
    context.roundRect(174, y - 7, 52, 14, 7);
    context.fillStyle = "#6174a8";
    context.fill();
    context.strokeStyle = "#d8f6ff";
    context.stroke();
    stroke(context, [[184, y - 6], [184, y + 6]], "#d8f6ff");
  }
  stroke(context, [[61, 79], [67, 75], [75, 74]], "#424b77", 2);
  stroke(context, [[61, 85], [67, 89], [75, 90]], "#424b77", 2);
  for (let x = 85; x <= 325; x += 9) {
    circle(context, x, 73, 1.25, "#495778");
    circle(context, x, 91, 1.25, "#495778");
  }
  context.restore();
}

new ResizeObserver(drawAircraftPlanform).observe(aircraftPlanform);
drawAircraftPlanform();

function pointAlong(points, progress) {
  const position = progress * (points.length - 1);
  const index = Math.min(Math.floor(position), points.length - 2);
  const t = position - index;
  const [x, y] = points[index];
  const [nextX, nextY] = points[index + 1];
  return [x + (nextX - x) * t, y + (nextY - y) * t];
}

function drawArtwork(canvas, type, phase = -1, progress = null) {
  const surface = fitCanvas(canvas);
  if (!surface) return;
  const { context: c, width, height } = surface;
  const fill = c.createLinearGradient(0, 0, width, height);
  fill.addColorStop(0, "#0d1c26");
  fill.addColorStop(1, "#193c39");
  c.fillStyle = fill;
  c.fillRect(0, 0, width, height);
  for (let x = 0; x < width; x += 24) stroke(c, [[x, 0], [x, height]], "#bbf1e010");
  for (let y = 0; y < height; y += 24) stroke(c, [[0, y], [width, y]], "#bbf1e010");

  const labels = {
    flight: "MISSION PROFILE · SCHEMATIC",
    orbit: "LOW EARTH ORBIT · SCHEMATIC",
    optics: "COMBINER RAY PATH · CONCEPT",
    lca: "PRODUCT LIFE CYCLE · SCHEMATIC"
  };
  c.font = "10px Consolas, monospace";
  c.fillStyle = "#a8cbc4";
  c.fillText(labels[type], 14, 20);
  const W = width - 43;
  const H = height - 61;
  c.translate(22, 36);
  c.lineJoin = "round";

  if (type === "flight") {
    const points = [[.02,.91], ...missionPhases.map(item => item.point), [.99,.91]].map(([x,y]) => [x*W,y*H]);
    const line = c.createLinearGradient(0, 0, 0, H);
    line.addColorStop(0, "#8ef0cd5f");
    line.addColorStop(1, "#8ef0cd03");
    c.beginPath();
    c.moveTo(points[0][0], H);
    points.forEach(([x,y]) => c.lineTo(x,y));
    c.lineTo(points.at(-1)[0], H);
    c.fillStyle = line;
    c.fill();
    stroke(c, [[0,H],[W,H]], "#9ac8c076");
    stroke(c, points, "#9af8ce", 2);
    c.font = "9px Consolas, monospace";
    for (let i = 0; i < missionPhases.length; i++) {
      const [x,y] = points[i+1];
      if (phase === i) circle(c, x,y,10,"#8ef0cd4d");
      circle(c,x,y,phase === i ? 5 : 3,"#baffdf");
    }
    if (progress !== null) {
      const [x, y] = pointAlong(points, progress);
      circle(c, x, y, 9, "#e4faad55");
      circle(c, x, y, 4, "#efffc4");
    }
    c.fillStyle = "#b2d8d0";
    c.fillText("RUNWAY", 0, H+14);
    c.textAlign = "right";
    c.fillText("RUNWAY", W, H+14);
    c.textAlign = "left";
    return;
  }

  if (type === "orbit") {
    const centerX = W*.5, centerY = H*.53, R = H*.43;
    const earth = c.createRadialGradient(centerX-R*.35,centerY-R*.3,0,centerX,centerY,R);
    earth.addColorStop(0,"#406f78");
    earth.addColorStop(1,"#132e3e");
    circle(c,centerX,centerY,R,earth);
    const radius = Math.min(W*.41,H*1.08);
    for (const [rotation, color, shift] of [[-.32,"#8ef0cd",0], [.33,"#6bb1d7",.36]]) {
      c.beginPath();
      c.ellipse(centerX,centerY,radius,R*.52,rotation,0,Math.PI*2);
      c.strokeStyle=color;
      c.lineWidth=1.3;
      c.stroke();
      const angle = ((progress ?? .1) + shift) * Math.PI * 2;
      const x = radius * Math.cos(angle), y = R*.52 * Math.sin(angle);
      circle(c, centerX+x*Math.cos(rotation)-y*Math.sin(rotation),
        centerY+x*Math.sin(rotation)+y*Math.cos(rotation), 4, color);
    }
    return;
  }

  if (type === "optics") {
    stroke(c, [[.20*W,.87*H],[.40*W,.87*H]], "#bfdbc9", 3);
    stroke(c, [[.42*W,.52*H],[.57*W,.68*H]], "#b4d6ca", 4);
    stroke(c, [[.61*W,.64*H],[.82*W,.03*H]], "#88b9d2", 4);
    for (const shift of [-.07,0,.07]) {
      const ray = [[(.28+shift)*W,.84*H],[(.49+shift)*W,.56*H],[(.70+shift)*W,.31*H],[(.22+shift)*W,.23*H]];
      stroke(c, ray, "#8ef0cdc8", 1.35);
      if (progress !== null) {
        const [x, y] = pointAlong(ray, progress);
        circle(c, x, y, 4, "#efffc4");
      }
    }
    circle(c,.17*W,.23*H,5,"#c5f1dc");
    return;
  }

  const x = W*.5, y = H*.51, rx = W*.33, ry = H*.34;
  c.beginPath();
  c.ellipse(x,y,rx,ry,0,0,Math.PI*2);
  c.strokeStyle = "#8ef0cd8f";
  c.stroke();
  if (progress !== null) {
    const angle = progress * 2 * Math.PI - Math.PI / 2;
    circle(c, x + rx*Math.cos(angle), y + ry*Math.sin(angle), 5, "#efffc4");
  }
  const nodes = [
    [x,y-ry,"MATERIAL"],[x+rx,y,"PRODUCTION"],[x,y+ry,"USE"],[x-rx,y,"END OF LIFE"]
  ];
  c.textAlign = "center";
  for (const [cx,cy,label] of nodes) {
    circle(c,cx,cy,6,"#183d39");
    circle(c,cx,cy,3,"#a8f7d7");
    c.fillStyle = "#d3ebe2";
    c.fillText(label,cx,cy+(cy<y ? -10 : 17));
  }
  c.textAlign = "left";
}

const cardObserver = new ResizeObserver(entries => {
  for (const { target } of entries) drawArtwork(target, target.dataset.art);
});

projectGrid.innerHTML = projects.map(project => {
  const artwork = project.art ?? project.id;
  const media = project.image
    ? `<img loading="lazy" src="./assets/${project.image}" alt="">`
    : `<canvas data-art="${artwork}" aria-hidden="true"></canvas>`;
  const tag = project.href ? "a" : "button";
  const action = project.href
    ? `href="${project.href}"`
    : `type="button" data-project="${project.id}" aria-haspopup="dialog"`;
  return `<${tag} ${action} class="project-card" data-category="${project.category}" aria-labelledby="title-${project.id}">
    <span class="card-media" data-art="${project.id}">${media}</span>
    <span class="card-body"><span class="card-meta">${project.course}</span>
    <span class="card-title" id="title-${project.id}">${project.title}</span>
    <span class="card-summary">${project.summary}</span>
    ${project.metrics ? `<span class="card-fact"><strong>${project.metrics[0][0]}</strong> ${project.metrics[0][1]}</span>` : ""}
    <span class="card-link">${project.href ? "View report case study" : "View case study"} <span aria-hidden="true">${project.href ? "↓" : "↗"}</span></span></span>
  </${tag}>`;
}).join("");

projectGrid.querySelectorAll("canvas").forEach(canvas => cardObserver.observe(canvas));
const cards = [...projectGrid.querySelectorAll(".project-card")];
for (const card of cards) {
  const preview = card.querySelector("canvas");
  if (!preview) continue;
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const play = () => {
    if (motion.matches || frame) return;
    const start = performance.now();
    const animate = time => {
      if (motion.matches || card.hidden) {
        stop();
        return;
      }
      const progress = Math.min(1, Math.max(0, (time - start) / 1150));
      drawArtwork(preview, preview.dataset.art, -1, progress);
      frame = progress < 1 ? requestAnimationFrame(animate) : 0;
    };
    frame = requestAnimationFrame(animate);
  };
  card.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") play();
  });
  card.addEventListener("focus", () => {
    if (card.matches(":focus-visible")) play();
  });
  card.addEventListener("pointerleave", stop);
  card.addEventListener("blur", stop);
}
const reportCard = projectGrid.querySelector('a[href="#lpu-report"]');
const report = document.querySelector("#lpu-report");
reportCard.after(report);
reportCard.setAttribute("aria-controls", report.id);
function syncReportCard() {
  reportCard.setAttribute("aria-expanded", String(location.hash === "#lpu-report"));
}
window.addEventListener("hashchange", syncReportCard);
syncReportCard();

const viewer = document.querySelector("#report-viewer");
const viewerStage = viewer.querySelector(".report-viewer-stage");
const viewerImage = viewerStage.querySelector("img");
const viewerCaption = viewer.querySelector("figcaption");
const viewerCount = viewer.querySelector(".report-viewer-count");
const figureLinks = [...report.querySelectorAll(".lpu-gallery figure a")];
let figureIndex = 0;
let figureTrigger;
let figureAnimations = [];
let swipeStart;

function showReportFigure(index, direction = 0) {
  figureIndex = (index + figureLinks.length) % figureLinks.length;
  const link = figureLinks[figureIndex];
  viewerImage.src = link.href;
  viewerImage.alt = link.querySelector("img").alt;
  const caption = link.nextElementSibling;
  viewerCaption.replaceChildren(...[...caption.children].map(item => item.cloneNode(true)));
  viewerCount.textContent = `${figureIndex + 1} / ${figureLinks.length}`;
  figureAnimations.forEach(animation => animation.cancel());
  figureAnimations = [];
  if (motion.matches) return;
  figureAnimations = [
    viewerImage.animate(
      [{ opacity: .4, transform: `translateX(${direction * 26}px) scale(.98)` }, { opacity: 1, transform: "none" }],
      { duration: 290, easing: "cubic-bezier(.2,.75,.25,1)" },
    ),
    viewerCaption.animate(
      [{ opacity: .4, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
      { duration: 240, easing: "ease-out" },
    ),
  ];
}

for (const [index, link] of figureLinks.entries()) {
  link.setAttribute("aria-label", `View ${link.nextElementSibling.querySelector("strong").textContent}`);
  link.setAttribute("aria-haspopup", "dialog");
  link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    figureTrigger = link;
    viewer.showModal();
    showReportFigure(index);
  });
}
viewer.querySelectorAll("[data-step]").forEach(button => button.addEventListener("click", () => {
  const direction = Number(button.dataset.step);
  showReportFigure(figureIndex + direction, direction);
}));
viewer.addEventListener("keydown", event => {
  const direction = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (!direction) return;
  event.preventDefault();
  showReportFigure(figureIndex + direction, direction);
});
viewerStage.addEventListener("pointerdown", event => {
  if (event.pointerType === "touch" && event.isPrimary) swipeStart = event;
});
viewerStage.addEventListener("pointercancel", () => { swipeStart = undefined; });
viewerStage.addEventListener("pointerup", event => {
  if (event.pointerId !== swipeStart?.pointerId) return;
  const dx = event.clientX - swipeStart.clientX;
  const dy = event.clientY - swipeStart.clientY;
  swipeStart = undefined;
  if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
  const direction = -Math.sign(dx);
  showReportFigure(figureIndex + direction, direction);
});
viewer.addEventListener("close", () => {
  swipeStart = undefined;
  figureAnimations.forEach(animation => animation.cancel());
  figureAnimations = [];
  figureTrigger?.focus({ preventScroll: true });
});
const filters = [...document.querySelectorAll("[data-filter]")];
for (const button of filters) {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach(item => item.setAttribute("aria-pressed", item === button));
    let count = 0;
    cards.forEach(card => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
      if (!card.hidden) {
        card.style.setProperty("--filter-delay", `${count * 38}ms`);
        card.classList.remove("filter-enter");
        requestAnimationFrame(() => card.classList.add("filter-enter"));
        count++;
      }
    });
    document.querySelector("#filter-status").textContent = `${count} projects shown.`;
  });
}

const schematics = {
  orbit: ["Orbit schematic", "Follow the two markers around their schematic orbital planes.", "Schematic of two inclined low Earth orbits"],
  optics: ["Light path schematic", "Follow light from the display, via the reflective surfaces, toward the driver’s eye."],
  lca: ["Life-cycle schematic", "Follow the cycle through materials, production, use and end of life.", "Schematic cycle linking materials, production, use and end of life"]
};

function renderVisual(project) {
  let figures = "";
  if (project.figures) {
    const controls = project.figures.length > 1
      ? `<div class="figure-controls" role="group" aria-label="Compare contour figures">${project.figures.map((figure, index) =>
        `<button type="button" data-figure="${index}" aria-pressed="${index === 0}">${figure.label}</button>`).join("")}</div>`
      : "";
    const first = project.figures[0];
    figures = `<section class="case-visual"><h3>Project figures</h3><p>${project.visual}</p>${controls}
      <img class="case-figure" src="./assets/${first.file}" alt="${first.alt}"></section>`;
  }
  if (project.id === "flight") {
    return `<section class="case-visual"><h3>Mission profile</h3><p>${project.visual}</p>
      <canvas class="mission-canvas" role="img" aria-label="${project.alt}"></canvas>
      <button type="button" class="play-demo" data-play-demo>Play mission</button>
      <div class="figure-controls" role="group" aria-label="Mission phase">${missionPhases.map((phase, index) =>
        `<button type="button" data-phase="${index}" aria-pressed="${index === 0}">${phase.label}</button>`).join("")}</div>
      <p id="phase-note" aria-live="polite">${missionPhases[0].note}</p></section>`;
  }
  const diagram = schematics[project.art ?? project.id];
  if (!diagram) return figures;
  return `${figures}<section class="case-visual"><h3>${diagram[0]}</h3><p>${diagram[1]}</p>
    <canvas class="mission-canvas" role="img" aria-label="${diagram[2] ?? project.alt}"></canvas>
    <button type="button" class="play-demo" data-play-demo>Play illustration</button></section>`;
}

let missionObserver;
let stopPlayback;
let openTrigger;

function openCase(project, trigger) {
  openTrigger = trigger;
  caseContent.innerHTML = `<p class="card-meta">${project.course} / ${project.format}</p>
    <h2 id="case-title">${project.title}</h2>
    <ul class="tag-list" aria-label="Methods and tools">${project.tags.map(tag => `<li>${tag}</li>`).join("")}</ul>
    ${project.metrics ? `<dl class="case-metrics">${project.metrics.map(([value, label]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>` : ""}
    <section class="case-copy"><h3>Engineering question</h3><p>${project.question}</p>
    <h3>Approach</h3><p>${project.method}</p>
    <h3>What we found</h3><p>${project.result}</p>
    ${project.detail ? `<h3>Technical details</h3><p>${project.detail}</p>` : ""}</section>${renderVisual(project)}`;
  dialog.showModal();
  dialog.scrollTop = 0;
  const figureButtons = [...caseContent.querySelectorAll("[data-figure]")];
  for (const button of figureButtons) {
    button.addEventListener("click", () => {
      const figure = project.figures[Number(button.dataset.figure)];
      const image = caseContent.querySelector(".case-figure");
      image.src = "./assets/" + figure.file;
      image.alt = figure.alt;
      if (!motion.matches) image.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 240 });
      figureButtons.forEach(item => item.setAttribute("aria-pressed", item === button));
    });
  }
  const missionCanvas = caseContent.querySelector(".mission-canvas");
  if (!missionCanvas) return;
  let phase = 0;
  let progress = null;
  let playbackFrame = 0;
  let started;
  let savedProgress = 0;
  const artwork = project.art ?? project.id;
  const play = caseContent.querySelector("[data-play-demo]");
  const playLabel = artwork === "flight" ? "Play mission" : "Play illustration";
  const phaseButtons = [...caseContent.querySelectorAll("[data-phase]")];
  const render = () => drawArtwork(missionCanvas, artwork, phase, progress);
  const selectPhase = selected => {
    phase = selected;
    phaseButtons.forEach((item, index) => item.setAttribute("aria-pressed", index === selected));
    caseContent.querySelector("#phase-note").textContent = missionPhases[selected].note;
  };
  stopPlayback = () => {
    cancelAnimationFrame(playbackFrame);
    playbackFrame = 0;
    started = undefined;
    play.textContent = playLabel;
  };
  const advance = time => {
    started ??= time;
    progress = Math.min(1, savedProgress + (time - started) / (artwork === "flight" ? 7000 : 4200));
    if (artwork === "flight") {
      const currentPhase = Math.max(0, Math.min(Math.round(progress * (missionPhases.length + 1)) - 1, missionPhases.length - 1));
      if (phase !== currentPhase) selectPhase(currentPhase);
    }
    render();
    if (progress < 1) playbackFrame = requestAnimationFrame(advance);
    else {
      savedProgress = 0;
      stopPlayback();
    }
  };
  play?.addEventListener("click", () => {
    if (playbackFrame) {
      savedProgress = progress ?? 0;
      stopPlayback();
    } else {
      play.textContent = "Pause animation";
      playbackFrame = requestAnimationFrame(advance);
    }
  });
  missionObserver = new ResizeObserver(render);
  missionObserver.observe(missionCanvas);
  render();
  for (const button of phaseButtons) {
    button.addEventListener("click", () => {
      stopPlayback();
      progress = null;
      savedProgress = 0;
      selectPhase(Number(button.dataset.phase));
      render();
    });
  }
}

document.addEventListener("click", event => {
  const trigger = event.target.closest("button[data-project]");
  if (!trigger) return;
  const project = projects.find(item => item.id === trigger.dataset.project);
  if (project) openCase(project, trigger);
});

dialog.addEventListener("pointerdown", event => {
  if (event.target !== dialog) return;
  const { left, right, top, bottom } = dialog.getBoundingClientRect();
  if (event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom) dialog.close();
});

dialog.addEventListener("close", () => {
  stopPlayback?.();
  stopPlayback = undefined;
  missionObserver?.disconnect();
  missionObserver = undefined;
  openTrigger?.focus({ preventScroll: true });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    let visibleIndex = 0;
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      revealObserver.unobserve(target);
      if (motion.matches || target.matches(":focus-within")) continue;
      target.style.setProperty("--entrance-delay", `${Math.min(visibleIndex, 4) * 38}ms`);
      target.classList.add("scroll-enter");
      visibleIndex++;
    }
  }, { threshold: .05 });
  const revealTargets = [
    ".section-head", ".project-card", ".research > *", ".lpu-copy", ".lpu-stages li",
    ".lpu-gallery-heading", ".lpu-gallery figure",
    ".timeline article", ".experience-intro", ".contact > *",
  ];
  document.querySelectorAll(revealTargets.join(", ")).forEach(item => revealObserver.observe(item));
}

const mesh = document.querySelector("#mesh");
const airflow = document.querySelector("#airflow");
const airflowToggle = document.querySelector("#airflow-toggle");
const ratioLabel = document.querySelector("#ratio-label");
const shapeButtons = [...document.querySelectorAll("[data-shape]")];
const modelState = { ratio: 1, yaw: -.64, pitch: -.26 };
const target = { ...modelState };
if (!motion.matches) modelState.yaw -= .27;
let raf = 0;
let pointer;
let spinning = false;
let modelVisible = false;
let lastTick;
let airflowEnabled = !motion.matches;
let airflowFrame = 0;
let airflowTime;
let airflowOffset = 0;
const spinButton = document.querySelector("#model-spin");
const frames = 15;
const sections = 36;

function projectPoint(x, y, z, width, height, scale) {
  const { yaw, pitch } = modelState;
  const rotatedX = x * Math.cos(yaw) + z * Math.sin(yaw);
  const depth = -x * Math.sin(yaw) + z * Math.cos(yaw);
  const rotatedY = y * Math.cos(pitch) - depth * Math.sin(pitch);
  const rotatedZ = y * Math.sin(pitch) + depth * Math.cos(pitch);
  const roll = .14;
  const perspective = 7.5 / (7.5 - rotatedZ);
  return [
    width*.5+(rotatedX*Math.cos(roll)+rotatedY*Math.sin(roll))*scale*perspective,
    height*.47+(-rotatedY*Math.cos(roll)+rotatedX*Math.sin(roll))*scale*perspective,
    rotatedZ
  ];
}

function drawMesh() {
  const surface = fitCanvas(mesh);
  if (!surface) return;
  const { context: c, width, height } = surface;
  const s = Math.min(width / 6.05, height / 3.82);
  const rings = [];
  for (let i=0; i<frames; i++) {
    const x = -2.25 + i/(frames-1)*4.5;
    const ring = [];
    for (let j=0; j<sections; j++) {
      const theta = j/sections*Math.PI*2;
      ring.push(projectPoint(x,Math.sin(theta)*modelState.ratio,Math.cos(theta),width,height,s));
    }
    rings.push(ring);
  }

  const quads = [];
  for (let i=0; i<frames-1; i++) {
    for (let j=0; j<sections; j++) {
      const k = (j+1)%sections;
      const vertices = [rings[i][j],rings[i+1][j],rings[i+1][k],rings[i][k]];
      const depth = vertices.reduce((sum,point)=>sum+point[2],0)/4;
      quads.push({ vertices, depth, i, j });
    }
  }
  quads.sort((a,b) => a.depth-b.depth);
  c.lineJoin = "round";
  for (const { vertices, depth, i, j } of quads) {
    const near = Math.max(0, Math.min(1, (depth+1.75)/3.5));
    const stripe = i === frames-3;
    const wireOpacity = (stripe ? .26 : (j%3 === 0 ? .12 : .07)) + near*.26;
    c.beginPath();
    vertices.forEach(([x,y],index)=>index ? c.lineTo(x,y) : c.moveTo(x,y));
    c.closePath();
    c.fillStyle = `rgba(${stripe ? "48,137,113" : "25,89,76"},${.14+near*.32})`;
    c.fill();
    c.strokeStyle = `rgba(145,255,216,${wireOpacity})`;
    c.lineWidth = stripe ? .8 : .55;
    c.stroke();
  }
  for (const end of [0,frames-1]) {
    stroke(c,rings[end],end ? "#b5ffdfdb" : "#83dcbb91",1.4,true);
  }
  const axisStart = projectPoint(-2.7,0,0,width,height,s);
  const axisEnd = projectPoint(2.72,0,0,width,height,s);
  c.setLineDash([4,6]);
  stroke(c,[axisStart,axisEnd],"#a8e7d28a");
  c.setLineDash([]);
  circle(c,axisEnd[0],axisEnd[1],2.6,"#a9ffdf");
}

function tick(time) {
  raf = 0;
  const spinActive = spinning && modelVisible && !document.hidden;
  if (spinActive && lastTick !== undefined) {
    target.yaw += Math.min(time - lastTick, 40) * .0006;
  }
  lastTick = spinActive ? time : undefined;
  let moving = false;
  for (const key of Object.keys(modelState)) {
    const delta = target[key] - modelState[key];
    if (motion.matches || Math.abs(delta) < .001) modelState[key] = target[key];
    else {
      modelState[key] += delta*.17;
      moving = true;
    }
  }
  drawMesh();
  if (moving || spinActive) queueMesh();
}

function queueMesh() {
  if (!raf) raf = requestAnimationFrame(tick);
}

function drawAirflow(time) {
  airflowFrame = 0;
  const active = airflowEnabled && modelVisible && !document.hidden;
  if (active && airflowTime !== undefined) {
    airflowOffset = (airflowOffset + Math.min(time - airflowTime, 40) * .15) % 144;
  }
  airflowTime = active ? time : undefined;

  const surface = fitCanvas(airflow);
  if (!surface) return;
  const { context, width, height } = surface;
  const colors = context.createLinearGradient(0, 0, width, 0);
  colors.addColorStop(0, "#55c9ff");
  colors.addColorStop(.48, "#9cffe1");
  colors.addColorStop(1, "#ffbe9d");

  for (const side of [-1, 1]) {
    for (let lane = 0; lane < 4; lane++) {
      const edge = height * (.46 + side * (.09 + lane * .068));
      const bend = side * height * (.27 - lane * .035);
      context.beginPath();
      context.moveTo(-12, edge);
      context.bezierCurveTo(width * .24, edge, width * .22, edge + bend, width * .45, edge + bend);
      context.bezierCurveTo(width * .69, edge + bend, width * .77, edge + height * .07, width + 14, edge + height * .07);
      context.setLineDash([]);
      context.lineWidth = 1;
      context.strokeStyle = "#7be9d849";
      context.stroke();
      context.setLineDash([24, 120]);
      context.lineDashOffset = lane * 29 + side * 17 - airflowOffset;
      context.lineWidth = lane === 0 ? 2.6 : 1.7;
      context.strokeStyle = colors;
      context.stroke();
    }
  }
  if (active) queueAirflow();
}

function queueAirflow() {
  if (!airflowFrame) airflowFrame = requestAnimationFrame(drawAirflow);
}

function setAirflow(enabled) {
  airflowEnabled = enabled;
  airflowTime = undefined;
  airflowToggle.textContent = enabled ? "Pause airflow" : "Play airflow";
  queueAirflow();
}

new ResizeObserver(() => {
  queueMesh();
  queueAirflow();
}).observe(mesh);
new IntersectionObserver(([entry]) => {
  modelVisible = entry.isIntersecting;
  queueMesh();
  queueAirflow();
}).observe(mesh);
document.addEventListener("visibilitychange", () => {
  airflowTime = undefined;
  queueMesh();
  queueAirflow();
});
airflowToggle.addEventListener("click", () => setAirflow(!airflowEnabled));
setAirflow(airflowEnabled);
function setSpin(value) {
  spinning = value;
  lastTick = undefined;
  spinButton?.setAttribute("aria-pressed", String(value));
  if (spinButton) spinButton.textContent = value ? "Pause rotation" : "Auto-rotate";
  queueMesh();
}
spinButton?.addEventListener("click", () => setSpin(!spinning));
motion.addEventListener("change", () => {
  if (motion.matches) setAirflow(false);
  queueMesh();
});
for (const button of shapeButtons) {
  button.addEventListener("click", () => {
    target.ratio = Number(button.dataset.shape);
    shapeButtons.forEach(item => item.setAttribute("aria-pressed", item === button));
    ratioLabel.textContent = "b/a = " + target.ratio.toFixed(2);
    queueMesh();
  });
}

for (const button of document.querySelectorAll("[data-turn]")) {
  button.addEventListener("click", () => {
    setSpin(false);
    target.yaw += Number(button.dataset.turn) * .24;
    queueMesh();
  });
}

mesh.addEventListener("pointerdown", event => {
  if (!event.isPrimary || event.button !== 0) return;
  setSpin(false);
  mesh.setPointerCapture(event.pointerId);
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
});

mesh.addEventListener("pointermove", event => {
  if (pointer?.id !== event.pointerId) return;
  target.yaw += (event.clientX-pointer.x) * .009;
  target.pitch = Math.max(-1.15, Math.min(1.15, target.pitch + (event.clientY-pointer.y)*.008));
  pointer.x = event.clientX;
  pointer.y = event.clientY;
  queueMesh();
});

mesh.addEventListener("lostpointercapture", () => { pointer = undefined; });
queueMesh();
