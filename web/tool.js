const urlbase = "http://localhost:5000/";

const demo = "གང་གི་ བློ་གྲོས་ སྒྲིབ་གཉིས་ སྤྲིན་བྲལ་ ཉི་ལྟར་ རྣམ་དག་ རབ་གསལ་བས། །\nཇི་སྙེད་ དོན་ཀུན་ ཇི་བཞིན་ གཟིགས་ཕྱིར་ ཉིད་ཀྱི་ ཐུགས་ཀར་ གླེགས་བམ་འཛིན། །\nགང་དག་ སྲིད་པའི་ བཙོན་རར་ མ་རིག་ མུན་འཐུམས་ སྡུག་བསྔལ་ གྱིས་གཟིར་བའི། །\nའགྲོ་ཚོགས་ ཀུན་ལ་ བུ་གཅིག་ ལྟར་བརྩེ་ ཡན་ལག་ དྲུག་བཅུའི་ དབྱངས་ལྡན་གསུང༌། །\nའབྲུག་ལྟར་ ཆེར་སྒྲོགས་ ཉོན་མོངས་ གཉིད་སློང་ ལས་ཀྱི་ ལྕགས་སྒྲོག་ འགྲོལ་མཛད་ཅིང༌། །\nམ་རིག་ མུན་སེལ་ སྡུག་བསྔལ་ མྱུ་གུ་ ཇི་སྙེད་ གཅོད་མཛད་ རལ་གྲི་བསྣམས། །\nགདོད་ནས་ དག་ཅིང་ ས་བཅུའི་ མཐར་སོན་ ཡོན་ཏན་ ལུས་རྫོགས་ རྒྱལ་སྲས་ ཐུ་བོའི་སྐུ། །\nབཅུ་ཕྲག་ བཅུ་དང་ བཅུ་གཉིས་ རྒྱན་སྤྲས་ བདག་བློའི་ མུན་སེལ་ འཇམ་པའི་ དབྱངས་ལ་ རབ་ཏུ་འདུད། །";

const original_elt = document.getElementById("original-text")
original_elt.value = demo;

async function SegmentAndPhoneticize() {
  const orig = document.getElementById("original-text").value; 
  const data = new FormData();
  data.append('str', orig);
  const response = await fetch(urlbase+'segment', {method: "POST", body: data});
  const res = await response.json();
  document.getElementById("segmented-text").value = res["segmented"];
  document.getElementById("kvp-text").value = res["kvp"];
  document.getElementById("api-text").value = res["api"];
}

async function Phoneticize() {
  const segmented = document.getElementById("segmented-text").value; 
  const response = await fetch(urlbase+'phoneticize');
  const res = await response.json();
  document.getElementById("kvp-text").value = res["kvp"];
  document.getElementById("api-text").value = res["api"];
}