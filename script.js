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
const distanceControl = document.querySelector("#distanceControl");
const materialControls = document.querySelectorAll("input[name='material']");
const dynamicLight = document.querySelector("#dynamicLight");
const dynamicObject = document.querySelector("#dynamicObject");
const dynamicShadow = document.querySelector("#dynamicShadow");
const dynamicBeam = document.querySelector("#dynamicBeam");
const objectLabel = document.querySelector("#objectLabel");
const labReadout = document.querySelector("#labReadout");

function currentMaterial() {
  return [...materialControls].find((control) => control.checked).value;
}

function updateLab() {
  const lightY = Number(heightControl.value);
  const objectX = Number(distanceControl.value);
  const material = currentMaterial();
  const screenX = 696;
  const distanceRatio = (500 - objectX) / 240;
  const shadowWidth = 30 + distanceRatio * 58;
  const shadowHeight = 68 + distanceRatio * 120 + Math.abs(lightY - 244) * .32;
  const shadowY = 246 + (244 - lightY) * .42;
  const opacityMap = { opaque: .68, translucent: .34, clear: .12 };
  const labelMap = { opaque: "不透明積木", translucent: "半透明色片", clear: "透明片" };
  const toneMap = { opaque: "顏色很深", translucent: "顏色變淡", clear: "幾乎看不見" };

  dynamicLight.setAttribute("transform", `translate(0 ${lightY - 244})`);
  dynamicObject.setAttribute("transform", `translate(${objectX - 388} 0)`);
  dynamicShadow.setAttribute("rx", Math.max(16, shadowWidth).toFixed(1));
  dynamicShadow.setAttribute("ry", Math.max(28, shadowHeight).toFixed(1));
  dynamicShadow.setAttribute("cy", shadowY.toFixed(1));
  dynamicShadow.style.fill = `rgba(23, 33, 43, ${opacityMap[material]})`;
  dynamicBeam.setAttribute("points", `128,${lightY + 6} 660,118 660,360`);
  objectLabel.textContent = labelMap[material];

  const sizeText = shadowWidth > 64 ? "影子變大" : shadowWidth < 42 ? "影子變小" : "影子中等大小";
  const angleText = lightY < 165 ? "光源較高，影子位置往下移" : lightY > 285 ? "光源較低，影子被拉長並往上移" : "光源高度接近中間";
  labReadout.textContent = `${sizeText}，${toneMap[material]}。${angleText}。這次請只改變一個變因，才能公平比較。`;
}

[heightControl, distanceControl, ...materialControls].forEach((control) => {
  control.addEventListener("input", updateLab);
});
updateLab();

const stepStage = document.querySelector("#stepStage");
const stepCaption = document.querySelector("#stepCaption");
const prevStep = document.querySelector("#prevStep");
const nextStep = document.querySelector("#nextStep");
const captions = [
  "第 1 步：先放好光源，確認光照向螢幕。",
  "第 2 步：打開光源，光線沿著直線前進。",
  "第 3 步：把物體放進光路中，物體開始擋住部分光。",
  "第 4 步：被擋住的光無法到達螢幕，暗區形成影子。",
  "第 5 步：把物體靠近光源，螢幕上的影子會變大。"
];
let step = 1;

function updateStep() {
  stepStage.dataset.step = String(step);
  stepCaption.textContent = captions[step - 1];
  prevStep.disabled = step === 1;
  nextStep.disabled = step === captions.length;
}

prevStep.addEventListener("click", () => {
  step = Math.max(1, step - 1);
  updateStep();
});

nextStep.addEventListener("click", () => {
  step = Math.min(captions.length, step + 1);
  updateStep();
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
  const correctCount = [...answered.values()].filter(Boolean).length;
  quizScore.textContent = `已答 ${answered.size} / ${window.quizQuestions.length}，答對 ${correctCount} 題`;
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
