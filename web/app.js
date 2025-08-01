window.alpineData = function () {
  // Keys for localStorage
  const STORAGE_KEYS = {
    originalText: "kvp_originalText",
    segmentedText: "kvp_segmentedText",
    segmentationType: "kvp_segmentationType",
    phoneticization: "kvp_phoneticization",
  };

  // Helper to load from storage, fallback to default
  function load(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  const defaultText = stripIndent(`
      གང་གི་བློ་གྲོས་སྒྲིབ་གཉིས་སྤྲིན་བྲལ་ཉི་ལྟར་རྣམ་དག་རབ་གསལ་བས།།
      ཇི་སྙེད་དོན་ཀུན་ཇི་བཞིན་གཟིགས་ཕྱིར་ཉིད་ཀྱི་ཐུགས་ཀར་གླེགས་བམ་འཛིན།།
      གང་དག་སྲིད་པའི་བཙོན་རར་མ་རིག་མུན་འཐུམས་སྡུག་བསྔལ་གྱིས་གཟིར་བའི།།
      འགྲོ་ཚོགས་ཀུན་ལ་བུ་གཅིག་ལྟར་བརྩེ་ཡན་ལག་དྲུག་བཅུའི་དབྱངས་ལྡན་གསུང༌།།
      འབྲུག་ལྟར་ཆེར་སྒྲོགས་ཉོན་མོངས་གཉིད་སློང་ལས་ཀྱི་ལྕགས་སྒྲོག་འགྲོལ་མཛད་ཅིང༌།།
      མ་རིག་མུན་སེལ་སྡུག་བསྔལ་མྱུ་གུ་ཇི་སྙེད་གཅོད་མཛད་རལ་གྲི་བསྣམས།།
      གདོད་ནས་དག་ཅིང་ས་བཅུའི་མཐར་སོན་ཡོན་ཏན་ལུས་རྫོགས་རྒྱལ་སྲས་ཐུ་བོའི་སྐུ།།
      བཅུ་ཕྲག་བཅུ་དང་བཅུ་གཉིས་རྒྱན་སྤྲས་བདག་བློའི་མུན་སེལ་འཇམ་པའི་དབྱངས་ལ་རབ་ཏུ་འདུད།།
    `);
  const storedText = load(STORAGE_KEYS.originalText, defaultText);

  return {
    step: 1,
    originalText: storedText === "" ? defaultText : storedText,
    segmentedText: load(STORAGE_KEYS.segmentedText, ""),
    segmentationType: load(STORAGE_KEYS.segmentationType, "words"),
    phoneticization: load(STORAGE_KEYS.phoneticization, "kvp"),
    phoneticResult: null,
    showHelp: false,
    activeHelpType: "",
    copied: false,
    // Progressive vertical UI state
    showSegmentation: false,
    showSegmented: false,
    showPhonetic: false,

    async segment() {
      const formData = new FormData();
      formData.append("str", this.originalText);

      const endpoint =
        this.segmentationType === "words"
          ? "/segmentbywords"
          : this.segmentationType === "two"
          ? "/segmentbytwo"
          : "/segmentbyone";

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        this.segmentedText = data.segmented.replace(/^ +/gm, "");

        // Transform and store results
        this.phoneticResult = {
          kvp: kvptodisplay(data.kvp),
          ipa: ipatodisplay(data.ipa),
          advanced: ipatophon(data.ipa, "advanced"),
          intermediate: ipatophon(data.ipa, "intermediate"),
          simple: ipatophon(data.ipa, "simple"),
        };

        this.step = 2;
        // UI state for vertical progressive flow will be handled by $watch hooks below
        // Auto-switch to KVP tab for 1 or 2 syllable segmentation
        if (
          this.segmentationType === "words" ||
          this.segmentationType === "two"
        ) {
          this.phoneticization = "kvp";
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },

    init() {
      // On init, load from localStorage is already handled in data above
      this.$nextTick(() => {
        if (this.originalText && this.originalText.trim() !== "") {
          this.segmentationType = this.segmentationType || "words";
          this.segment().then(() => {
            this.phoneticization = this.phoneticization || "kvp";
            this.phoneticize();
          });
        } else {
          this.segmentedText = "";
          this.phoneticResult = null;
        }
      });

      // Watch and persist fields to localStorage
      this.$watch("originalText", (val) => {
        try {
          localStorage.setItem(STORAGE_KEYS.originalText, val);
        } catch (e) {}
      });
      this.$watch("segmentedText", (val) => {
        try {
          localStorage.setItem(STORAGE_KEYS.segmentedText, val);
        } catch (e) {}
      });
      this.$watch("segmentationType", (val) => {
        try {
          localStorage.setItem(STORAGE_KEYS.segmentationType, val);
        } catch (e) {}
      });
      this.$watch("phoneticization", (val) => {
        try {
          localStorage.setItem(STORAGE_KEYS.phoneticization, val);
        } catch (e) {}
      });

      // Debounce helpers
      let segmentTimeout = null;
      let phoneticizeTimeout = null;
      const debounce = (fn, timeoutVar, ms = 120) => {
        if (timeoutVar) clearTimeout(timeoutVar);
        return setTimeout(fn, ms);
      };

      // Live: When originalText changes, segment and phoneticize
      this.$watch("originalText", (val) => {
        if (val && val.trim() !== "") {
          this.segmentationType = this.segmentationType || "words";
          segmentTimeout = debounce(() => {
            this.segment();
          }, segmentTimeout);
        } else {
          this.segmentedText = "";
          this.phoneticResult = null;
        }
      });

      // Live: When segmentedText changes, phoneticize
      this.$watch("segmentedText", (val) => {
        if (val && val.trim() !== "") {
          this.phoneticization = this.phoneticization || "kvp";
          phoneticizeTimeout = debounce(() => {
            this.phoneticize();
          }, phoneticizeTimeout);
        } else {
          this.phoneticResult = null;
        }
      });

      // Live: When phoneticization changes, re-phoneticize
      this.$watch("phoneticization", (val) => {
        if (this.segmentedText && this.segmentedText.trim() !== "") {
          this.phoneticize();
        }
      });
    },

    async phoneticize() {
      const formData = new FormData();
      formData.append("str", this.segmentedText);

      try {
        const response = await fetch("/phoneticize", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        // Transform and store results
        this.phoneticResult = {
          kvp: kvptodisplay(data.kvp),
          ipa: ipatodisplay(data.ipa),
          advanced: ipatophon(data.ipa, "advanced"),
          intermediate: ipatophon(data.ipa, "intermediate"),
          simple: ipatophon(data.ipa, "simple"),
        };
      } catch (error) {
        console.error("Error:", error);
      }
    },

    getPhoneticResult(type) {
      if (!this.phoneticResult) {
        return "";
      }
      return this.phoneticResult[type] || "";
    },

    async copyToClipboard(text) {
      try {
        // Strip HTML tags for clipboard
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;
        const cleanText = tempDiv.textContent || tempDiv.innerText || "";

        await navigator.clipboard.writeText(cleanText);
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      } catch (error) {
        console.error("Error copying to clipboard:", error);
      }
    },
  };
};

const stripIndent = (str) =>
  str
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

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
    res = res.replace(/[̱̄3˥˦˧˨˩]/g, "");
    res = res.replace(/ʔ([kp])\u031A/g, "<sub>$1</sub>");
    res = res.replace(/ʔ/g, "<sub>ʔ</sub>");
    res = res.replace(/ɔ/g, "o");
    res = res.replace(/ə/g, "<span class='gray'>a</span>");
    res = res.replace(/n\u031A/g, "n");
  } else {
    res = res.replace(/[̱̄3ʰʔ\u031Aː˥˦˧˨˩]/g, "");
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
