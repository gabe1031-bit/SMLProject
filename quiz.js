// quiz.js (MV3-safe: NO inline handlers, NO onclick strings, NO innerHTML buttons)

const quiz = [
  // Based on your extension’s content (facts/pages)
  {question:"What causes the seasons?",answers:["Earth’s tilted axis","Ocean currents","Earthquakes","The Moon’s phases"],correct:0},
  {question:"Weather is ____ and climate is ____.",answers:["short-term; long-term pattern","long-term; short-term pattern","only temperature; only rain","the same thing"],correct:0},
  {question:"Warm air can hold more ____ than cold air.",answers:["water vapor","sand","ice","rock"],correct:0},
  {question:"The ozone layer helps absorb much of the Sun’s harmful ____ radiation.",answers:["UV","radio","sound","gravity"],correct:0},
  {question:"Ocean currents move ____ around the planet and can shape regional climates.",answers:["heat","rocks","trees","clouds"],correct:0},
  {question:"Precipitation forms after water vapor changes back into liquid through ____.",answers:["condensation","evaporation","radiation","erosion"],correct:0},
  {question:"Dry climates typically receive less than about ____ mm of rainfall per year.",answers:["250","2,500","25","1,000"],correct:0},
  {question:"Dry climates commonly form under persistent ____ systems.",answers:["high-pressure","low-pressure","volcanic","ocean-floor"],correct:0},
  {question:"Drought is not just lack of rain — it also depends on temperature, evaporation, and ____ moisture.",answers:["soil","moon","rock","ozone"],correct:0},
  {question:"Continental climates form far from large bodies of ____.",answers:["water","lava","mountains","ice"],correct:0},
  {question:"Tropical climates are found near the ____.",answers:["equator","North Pole","South Pole","mountaintops only"],correct:0},
  {question:"Snow is a type of ____.",answers:["precipitation","earthquake","ocean current","radiation"],correct:0},
  {question:"Snow forms when temperatures are at or below about ____ °C.",answers:["0","10","32","100"],correct:0},
  {question:"Earthquakes form when tectonic plates ____ and release stored energy.",answers:["slip","freeze","evaporate","turn into clouds"],correct:0},
  {question:"Tornadoes are narrow, fast rotating ____.",answers:["winds","ocean currents","clouds","earthquakes"],correct:0},
  {question:"Blizzards are snow combined with strong ____ and low visibility.",answers:["winds","earthquakes","currents","UV rays"],correct:0},
  {question:"Hurricanes and typhoons are both tropical ____.",answers:["cyclones","earthquakes","droughts","blizzards"],correct:0},
  {question:"A tsunami is a huge wave often caused by underwater ____ activity.",answers:["earthquake","humidity","ozone","rain shadow"],correct:0},
  {question:"Mountains can create rain shadows, making one side wetter and the other side ____.",answers:["drier","colder","hotter","windier"],correct:0},
  {question:"Clouds can cool Earth by reflecting sunlight and warm Earth by trapping ____.",answers:["heat","dirt","wind","plants"],correct:0},

  // Repeat the same topics in different wording to reach 40, still aligned to your content
  {question:"Winter happens when a hemisphere is tilted ____ from the Sun.",answers:["away","toward","under","inside"],correct:0},
  {question:"High pressure can reduce rain by preventing air from ____.",answers:["rising","moving","spinning","melting"],correct:0},
  {question:"Dry climates often have big temperature changes between day and ____.",answers:["night","spring","clouds","oceans"],correct:0},
  {question:"Condensation is when water vapor turns into ____.",answers:["liquid water","sand","oxygen","lava"],correct:0},
  {question:"Precipitation includes rain, snow, and ____.",answers:["hail","magma","rocks","sunlight"],correct:0},
  {question:"Ocean currents help distribute heat from the ____ toward other regions.",answers:["equator","mantle","core","moon"],correct:0},
  {question:"Climate describes the ____ pattern of weather in a region.",answers:["long-term","hourly","minute-by-minute","random"],correct:0},
  {question:"Snow is made of ice ____ in the air.",answers:["crystals","pebbles","bubbles","waves"],correct:0},
  {question:"A landslide is a mass of material moving downhill due to ____.",answers:["gravity","UV rays","condensation","ITCZ"],correct:0},
  {question:"The ozone layer is important because it blocks harmful ____.",answers:["UV rays","earthquakes","currents","hail"],correct:0},
  {question:"Drought impacts water supplies as rivers and reservoirs ____.",answers:["drop/shrink","freeze forever","turn to lava","stop existing"],correct:0},
  {question:"Continental climates have large seasonal temperature ____.",answers:["differences","equalities","constants","copies"],correct:0},
  {question:"Tropical areas often have high humidity and heavy ____.",answers:["rainfall","snowfall","ashfall","hailstorms only"],correct:0},
  {question:"Typhoons vs hurricanes mainly differ by the ____ they form in.",answers:["region","temperature","cloud color","moon phase"],correct:0},
  {question:"Blizzards are dangerous partly because visibility is very ____.",answers:["low","high","perfect","unchanged"],correct:0},
  {question:"Snow is a form of precipitation made from frozen ____.",answers:["water","sand","oxygen","carbon"],correct:0},
  {question:"Weather describes conditions over a ____ time period.",answers:["short","geologic","million-year","permanent"],correct:0},
  {question:"Clouds form when water vapor cools and ____.",answers:["condenses","evaporates","burns","erupts"],correct:0},
  {question:"Dry climates commonly occur where air sinks in ____ systems.",answers:["high-pressure","low-pressure","storm-core","volcanic"],correct:0},
  {question:"Ocean currents can affect climates near ____.",answers:["coastlines","volcanoes only","earthquakes only","deserts only"],correct:0}
];

// Shuffle questions each time
quiz.sort(() => Math.random() - 0.5);

let current = 0;
let score = 0;
let answered = false;

function $(id) { return document.getElementById(id); }

function shuffleAnswers(question) {
  const answers = question.answers.map((text, index) => ({
    text,
    correct: index === question.correct
  }));

  answers.sort(() => Math.random() - 0.5);

  question.answers = answers.map(a => a.text);
  question.correct = answers.findIndex(a => a.correct);
  
}
function renderQuestion() {
  answered = false;

  const q = quiz[current];
  
  shuffleAnswers(q);
  
  $("question").textContent = `Question ${current + 1} of ${quiz.length}: ${q.question}`;
  $("result").textContent = "";

  const answersDiv = $("answers");
  answersDiv.textContent = ""; // no innerHTML with buttons

  q.answers.forEach((text, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = text;
    btn.addEventListener("click", () => selectAnswer(idx));
    answersDiv.appendChild(btn);
  });
}

function selectAnswer(idx) {
  if (answered) return;
  answered = true;

  if (idx === quiz[current].correct) {
    $("result").textContent = "✅ Correct!";
    score++;
  } else {
    $("result").textContent = "❌ Incorrect";
  }
}

function showResults() {
  $("question").textContent = "Quiz Complete!";
  $("answers").textContent = "";
  $("result").textContent = `Your Score: ${score} / ${quiz.length}`;
  $("nextBtn").textContent = "Restart Quiz";
  $("nextBtn").dataset.mode = "restart";
}

function nextOrRestart() {
  const mode = $("nextBtn").dataset.mode;

  if (mode === "restart") {
    // restart
    current = 0;
    score = 0;
    quiz.sort(() => Math.random() - 0.5);
    $("nextBtn").textContent = "Next Question";
    $("nextBtn").dataset.mode = "next";
    renderQuestion();
    return;
  }

  // next
  if (current >= quiz.length - 1) {
    showResults();
    return;
  }

  current++;
  renderQuestion();
}

document.addEventListener("DOMContentLoaded", () => {
  const nextBtn = $("nextBtn");
  nextBtn.dataset.mode = "next";
  nextBtn.addEventListener("click", nextOrRestart);
  renderQuestion();
});