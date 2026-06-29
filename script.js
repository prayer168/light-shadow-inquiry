const tabTriggers = document.querySelectorAll(".tab-trigger");
const tabPanels = document.querySelectorAll(".tab-panel");

tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = trigger.dataset.tab;
    tabPanels.forEach((panel) => panel.classList.toggle("active", panel.id === target));
    tabTriggers.forEach((button) => button.classList.toggle("active", button.dataset.tab === target));
    document.querySelector("main").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const heightControl = document.querySelector("#heightControl");
const lightDistanceControl = document.querySelector("#lightDistanceControl");
const distanceControl = document.querySelector("#distanceControl");
const materialControls = document.querySelectorAll("input[name='material']");
const dynamicLight = document.querySelector("#dynamicLight");
const dynamicObject = document.querySelector("#dynamicObject");
const dynamicShadow = document.querySelector("#dynamicShadow");
const dynamicBeam = document.querySelector("#dynamicBeam");
const objectLabel = document.querySelector("#objectLabel");
const labReadout = document.querySelector("#labReadout");
const heightValue = document.querySelector("#heightValue");
const lightDistanceValue = document.querySelector("#lightDistanceValue");
const distanceValue = document.querySelector("#distanceValue");
const lightLabel = document.querySelector("#lightLabel");

function currentMaterial() {
  return [...materialControls].find((control) => control.checked).value;
}

function bump(el) {
  if (!el) return;
  el.classList.remove("bump");
  void el.offsetWidth;
  el.classList.add("bump");
}

function updateLab() {
  const lightY = Number(heightControl.value);
  const lightShift = Number(lightDistanceControl.value);
  const objectX = Number(distanceControl.value);
  const material = currentMaterial();
  const proximity = lightShift / 170;
  const distanceRatio = (500 - objectX) / 240;
  const shadowWidth = 30 + distanceRatio * 48 + proximity * 26;
  const shadowHeight = 68 + distanceRatio * 108 + proximity * 46 + Math.abs(lightY - 244) * .32;
  const shadowY = 246 + (244 - lightY) * .42;
  const opacityMap = { opaque: .68, translucent: .34, clear: .12 };
  const labelMap = { opaque: "不透明積木", translucent: "半透明色片", clear: "透明片" };
  const toneMap = { opaque: "顏色很深", translucent: "顏色變淡", clear: "幾乎看不見" };

  dynamicLight.setAttribute("transform", `translate(${lightShift} ${lightY - 244})`);
  dynamicObject.setAttribute("transform", `translate(${objectX - 388} 0)`);
  dynamicShadow.setAttribute("rx", Math.max(16, shadowWidth).toFixed(1));
  dynamicShadow.setAttribute("ry", Math.max(28, shadowHeight).toFixed(1));
  dynamicShadow.setAttribute("cy", shadowY.toFixed(1));
  dynamicShadow.style.fill = `rgba(23, 33, 43, ${opacityMap[material]})`;
  dynamicBeam.setAttribute("points", `${128 + lightShift},${lightY + 6} 660,118 660,360`);
  lightLabel.setAttribute("x", String(58 + lightShift));
  objectLabel.textContent = labelMap[material];

  const sizeText = shadowWidth > 70 ? "影子變大" : shadowWidth < 44 ? "影子變小" : "影子中等大小";
  const angleText = lightY < 165 ? "光源較高，影子位置往下移" : lightY > 285 ? "光源較低，影子被拉長並往上移" : "光源高度接近中間";
  const nearText = proximity > .66 ? "光源靠近物體，影子變大" : proximity < .2 ? "光源遠離物體，影子較小" : "光源與物體距離適中";
  labReadout.textContent = `${sizeText}，${toneMap[material]}。${angleText}；${nearText}。這次請只改變一個變因，才能公平比較。`;

  heightValue.textContent = lightY < 165 ? "高" : lightY > 285 ? "低" : "中";
  lightDistanceValue.textContent = proximity > .66 ? "近" : proximity < .2 ? "遠" : "中";
  distanceValue.textContent = objectX < 320 ? "近" : objectX > 440 ? "遠" : "中";
}

function flashOutput() {
  labReadout.classList.remove("flash");
  void labReadout.offsetWidth;
  labReadout.classList.add("flash");
}

heightControl.addEventListener("input", () => { updateLab(); bump(heightValue); flashOutput(); });
lightDistanceControl.addEventListener("input", () => { updateLab(); bump(lightDistanceValue); flashOutput(); });
distanceControl.addEventListener("input", () => { updateLab(); bump(distanceValue); flashOutput(); });
materialControls.forEach((control) => {
  control.addEventListener("input", () => { updateLab(); flashOutput(); });
});
updateLab();

const stepStage = document.querySelector("#stepStage");
const stepCaption = document.querySelector("#stepCaption");
const prevStep = document.querySelector("#prevStep");
const nextStep = document.querySelector("#nextStep");
const playStep = document.querySelector("#playStep");
const stepDots = document.querySelector("#stepDots");
const captions = [
  "第 1 步：先放好光源，確認光照向螢幕。",
  "第 2 步：打開光源，光線沿著直線前進。",
  "第 3 步：把物體放進光路中，物體開始擋住部分光。",
  "第 4 步：被擋住的光無法到達螢幕，暗區形成影子。",
  "第 5 步：把物體靠近光源，螢幕上的影子會變大。"
];
let step = 1;
let playTimer = null;

captions.forEach(() => stepDots.append(document.createElement("span")));
const dots = stepDots.querySelectorAll("span");

function updateStep() {
  stepStage.dataset.step = String(step);
  stepCaption.textContent = captions[step - 1];
  prevStep.disabled = step === 1;
  nextStep.disabled = step === captions.length;
  dots.forEach((dot, index) => {
    dot.classList.toggle("done", index < step);
    dot.classList.toggle("current", index === step - 1);
  });
}

function stopPlay() {
  if (playTimer) clearInterval(playTimer);
  playTimer = null;
  playStep.setAttribute("aria-pressed", "false");
  playStep.textContent = "▶ 自動播放";
}

prevStep.addEventListener("click", () => {
  stopPlay();
  step = Math.max(1, step - 1);
  updateStep();
});

nextStep.addEventListener("click", () => {
  stopPlay();
  step = Math.min(captions.length, step + 1);
  updateStep();
});

playStep.addEventListener("click", () => {
  if (playTimer) { stopPlay(); return; }
  playStep.setAttribute("aria-pressed", "true");
  playStep.textContent = "⏸ 暫停";
  if (step === captions.length) { step = 1; updateStep(); }
  playTimer = setInterval(() => {
    if (step >= captions.length) { stopPlay(); return; }
    step += 1;
    updateStep();
  }, 1600);
});

updateStep();

const caseGrid = document.querySelector("#caseGrid");

window.lessonCases.forEach((item) => {
  const card = document.createElement("article");
  card.className = "case-card";
  card.innerHTML = `
    <h3>${item.title}</h3>
    <div class="case-visual" aria-hidden="true"><span></span></div>
    <p>${item.prompt}</p>
    <button type="button">查看建議</button>
    <div class="case-answer">${item.answer}</div>
  `;
  card.querySelector("button").addEventListener("click", () => card.classList.toggle("active"));
  caseGrid.append(card);
});

const quizGrid = document.querySelector("#quizGrid");
const quizScore = document.querySelector("#quizScore");
const resetQuiz = document.querySelector("#resetQuiz");
const answered = new Map();

function renderQuiz() {
  quizGrid.innerHTML = "";
  answered.clear();
  window.quizQuestions.forEach((question, index) => {
    const card = document.createElement("article");
    card.className = "quiz-card";
    card.innerHTML = `
      <h3>${index + 1}. ${question.q}</h3>
      <div class="choice-list"></div>
      <div class="feedback" aria-live="polite"></div>
    `;
    const choiceList = card.querySelector(".choice-list");
    question.choices.forEach((choice, choiceIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice;
      button.addEventListener("click", () => answerQuestion(index, choiceIndex, card));
      choiceList.append(button);
    });
    quizGrid.append(card);
  });
  updateScore();
}

function answerQuestion(index, choiceIndex, card) {
  if (answered.has(index)) return;
  const question = window.quizQuestions[index];
  const buttons = card.querySelectorAll(".choice-list button");
  const correct = choiceIndex === question.answer;
  answered.set(index, correct);
  card.classList.add("answered");
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === question.answer) button.classList.add("correct");
    if (buttonIndex === choiceIndex && !correct) button.classList.add("wrong");
  });
  card.querySelector(".feedback").textContent = `${correct ? "答對了。" : "再想想。"} ${question.explain}`;
  updateScore();
}

function updateScore() {
  const total = window.quizQuestions.length;
  const correctCount = [...answered.values()].filter(Boolean).length;
  quizScore.textContent = `已答 ${answered.size} / ${total}，答對 ${correctCount} 題`;
  const bar = document.querySelector("#quizBar");
  if (bar) bar.style.width = `${(answered.size / total) * 100}%`;
}

resetQuiz.addEventListener("click", renderQuiz);
renderQuiz();

const resourceList = document.querySelector("#resourceList");
window.lessonResources.forEach((item) => {
  const card = document.createElement("article");
  card.className = "resource-card";
  card.innerHTML = `
    <h3><a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a></h3>
    <p>${item.note}</p>
    <div class="resource-meta">
      <span>${item.source}</span>
      <span>${item.grade}</span>
      <span>查核：${item.checkedDate}</span>
    </div>
  `;
  resourceList.append(card);
});
