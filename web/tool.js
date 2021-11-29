const urlbase = "http://localhost:5000/";

const demo = "གང་གི་བློ་གྲོས་སྒྲིབ་གཉིས་སྤྲིན་བྲལ་ཉི་ལྟར་རྣམ་དག་རབ་གསལ་བས།།\nཇི་སྙེད་དོན་ཀུན་ཇི་བཞིན་གཟིགས་ཕྱིར་ཉིད་ཀྱི་ཐུགས་ཀར་གླེགས་བམ་འཛིན།།\nགང་དག་སྲིད་པའི་བཙོན་རར་མ་རིག་མུན་འཐུམས་སྡུག་བསྔལ་གྱིས་གཟིར་བའི།།\nའགྲོ་ཚོགས་ཀུན་ལ་བུ་གཅིག་ལྟར་བརྩེ་ཡན་ལག་དྲུག་བཅུའི་དབྱངས་ལྡན་གསུང༌།།\nའབྲུག་ལྟར་ཆེར་སྒྲོགས་ཉོན་མོངས་གཉིད་སློང་ལས་ཀྱི་ལྕགས་སྒྲོག་འགྲོལ་མཛད་ཅིང༌།།\nམ་རིག་མུན་སེལ་སྡུག་བསྔལ་མྱུ་གུ་ཇི་སྙེད་གཅོད་མཛད་རལ་གྲི་བསྣམས།།\nགདོད་ནས་དག་ཅིང་ས་བཅུའི་མཐར་སོན་ཡོན་ཏན་ལུས་རྫོགས་རྒྱལ་སྲས་ཐུ་བོའི་སྐུ།།\nབཅུ་ཕྲག་བཅུ་དང་བཅུ་གཉིས་རྒྱན་སྤྲས་བདག་བློའི་མུན་སེལ་འཇམ་པའི་དབྱངས་ལ་རབ་ཏུ་འདུད།།";

const original_elt = document.getElementById("original-text")
original_elt.value = demo;

function ipatophon(ipa, level) {
  res = ipa.replace(/(?:\r\n|\r|\n)/g, "<br/>");
  res = res.replace(/y/g, "ü");
  res = res.replace(/c/g, "ky");
  if (level == "advanced") {
    res = res.replace(/ɔ([\u0304\u0331])?/g, "<span class='gray'>o$1</span>");
    res = res.replace(/ə([\u0304\u0331])?/g, "<span class='gray'>a$1</span>");
    res = res.replace(/3/g, "<span class='gray'>ʰ</span>");
    res = res.replace(/ʔ([kp])\u031A/g, "<sub>$1</sub>");
    res = res.replace(/ʔ/g, "<sub>ʔ</sub>");
    res = res.replace(/n\u031A/g, "n");
  } else if (level == "intermediate") {
    res = res.replace(/[̱̄3]/g, "");
    res = res.replace(/ʔ([kp])\u031A/g, "<sub>$1</sub>");
    res = res.replace(/ʔ/g, "<sub>ʔ</sub>");
    res = res.replace(/ɔ/g, "o");
    res = res.replace(/ə/g, "<span class='gray'>a</span>");
    res = res.replace(/n\u031A/g, "n");
  } else {
    res = res.replace(/[̱̄3ʰʔ\u031Aː]/g, "");
    res = res.replace(/ɔ/g, "o");
    res = res.replace(/ə/g, "a");
    res = res.replace(/n\u031A/g, "n");
  }
  res = res.replace(/ɣ/g, "g");
  res = res.replace(/[̥̊]/g, ""); // half-voicing, not displayed
  res = res.replace(/ɖ/g, "ḍ");
  res = res.replace(/ʈ/g, "ṭ");
  res = res.replace(/ɲ/g, "ny");
  res = res.replace(/ø/g, "ö");
  res = res.replace(/ɟ/g, "gy");
  res = res.replace(/j/g, "y");
  res = res.replace(/ɛ/g, "è");
  res = res.replace(/e/g, "é");
  res = res.replace(/ŋ(\s)/g, "ng$1");
  res = res.replace(/ŋ/g, "ṅ");
  res = res.replace(/tɕ/g, "ch");
  res = res.replace(/ɕ/g, "sh");
  res = res.replace(/dʑ/g, "j");
  res = res.replace(/dz/g, "z");
  return res;
}

function ipatodisplay(ipa) {
  res = ipa.replace(/(?:\r\n|\r|\n)/g, "<br/>");
  res = res.replace(/3/g, "<span class='gray'>ʰ</span>");
  return res;
}

function kvptodisplay(kvp) {
  res = kvp.replace(/(?:\r\n|\r|\n)/g, "<br/>");
  return res;
}

async function SegmentAndPhoneticize(arg) {
  const orig = document.getElementById("original-text").value; 
  const data = new FormData();
  data.append('str', orig);
  let response
  if (arg == "2")
      response= await fetch(urlbase+'segmentbytwo', {method: "POST", body: data});
  else
      response= await fetch(urlbase+'segment', {method: "POST", body: data});
  const res = await response.json();
  document.getElementById("segmented-text").value = res["segmented"];
  document.getElementById("kvp-text").innerHTML = kvptodisplay(res["kvp"]);
  document.getElementById("ipa-text").innerHTML = ipatodisplay(res["ipa"]);
  document.getElementById("advanced-text").innerHTML = ipatophon(res["ipa"], "advanced");
  document.getElementById("intermediate-text").innerHTML = ipatophon(res["ipa"], "intermediate");
  document.getElementById("simple-text").innerHTML = ipatophon(res["ipa"], "simple");
  if (arg == "2")
    document.getElementById("kvp-tab").click();
  else 
    document.getElementById("segmented-tab").click();
}

async function Phoneticize() {
  const segmented = document.getElementById("segmented-text").value; 
  const data = new FormData();
  data.append('str', segmented);
  const response = await fetch(urlbase+'phoneticize', {method: "POST", body: data});
  const res = await response.json();
  document.getElementById("kvp-text").innerHTML = kvptodisplay(res["kvp"]);
  document.getElementById("ipa-text").innerHTML = ipatodisplay(res["ipa"]);
  document.getElementById("advanced-text").innerHTML = ipatophon(res["ipa"], "advanced");
  document.getElementById("intermediate-text").innerHTML = ipatophon(res["ipa"], "intermediate");
  document.getElementById("simple-text").innerHTML = ipatophon(res["ipa"], "simple");
  document.getElementById("kvp-tab").click();
}