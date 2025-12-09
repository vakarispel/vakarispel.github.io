/* assets/js/custom.js
   Turinio autorius: automatinis įskiepis - pritaikyta CV projektui
   Turinys: formos logika + memory game logika
*/

document.addEventListener("DOMContentLoaded", function () {

  /* ============================
     ========== FORM ===========
     ============================ */

  const form = document.querySelector(".php-email-form");
  const submitBtn = form.querySelector("button[type='submit']");
  submitBtn.disabled = true;

  // Elemente laukų pasirinkimai — atsparūs net jei name kitoks
  const vardas = form.querySelector("input[name='vardas']");
  const pavarde = form.querySelector("input[name='pavarde']");
  const email = form.querySelector("input[type='email']");
  const telefonas = form.querySelector("input[type='tel']");
  const adresas = form.querySelector("input[name='adresas']");
  const sliders = [
    form.querySelector("input[name='vertinimas1']"),
    form.querySelector("input[name='vertinimas2']"),
    form.querySelector("input[name='vertinimas3']")
  ];

  // Rezultatų blokas (jei nėra, sukuriame)
  let resultBox = form.querySelector(".result-box");
  if (!resultBox) {
    resultBox = document.createElement("div");
    resultBox.className = "result-box";
    resultBox.style.marginTop = "18px";
    form.appendChild(resultBox);
  }

  // POP-UP (jeigu nėra)
  let popup = document.querySelector(".success-popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "success-popup";
    popup.textContent = "✅ Duomenys pateikti sėkmingai!";
    document.body.appendChild(popup);
  }

  // Validacijos ir stiliai: jeigu formoje nėra form-group elementų, apgaubkime laukus
  function ensureFormGroup(input) {
    if (!input) return;
    let g = input.closest(".form-group");
    if (!g) {
      // sukurti wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "form-group";
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      // pridėti klaidos teksto vietą
      const err = document.createElement("div");
      err.className = "form-error";
      wrapper.appendChild(err);
      return wrapper;
    } else {
      // užtikrinti .form-error elementą
      if (!g.querySelector(".form-error")) {
        const err = document.createElement("div");
        err.className = "form-error";
        g.appendChild(err);
      }
      return g;
    }
  }

  [vardas, pavarde, email, telefonas, adresas].forEach(ensureFormGroup);

  function setError(input, message) {
    const group = input.closest(".form-group");
    if (!group) return;
    group.classList.add("error");
    group.classList.remove("success");
    const err = group.querySelector(".form-error");
    if (err) err.textContent = message;
  }

  function setSuccess(input) {
    const group = input.closest(".form-group");
    if (!group) return;
    group.classList.remove("error");
    group.classList.add("success");
  }

  function validateNameValue(value) {
    return /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s]+$/.test(value.trim());
  }
  function validateEmailValue(value) {
    return /^\S+@\S+\.\S+$/.test(value.trim());
  }

  function validateAddressValue(value) {
    return value.trim().length > 3;
  }

  function liveValidate(input) {
    if (!input) return false;
    const v = input.value || "";
    if (v.trim() === "") {
      setError(input, "Laukas negali būti tuščias");
      return false;
    }
    if (input === vardas || input === pavarde) {
      if (!validateNameValue(v)) {
        setError(input, "Tik raidės");
        return false;
      }
    }
    if (input === email) {
      if (!validateEmailValue(v)) {
        setError(input, "Neteisingas el. paštas");
        return false;
      }
    }
    if (input === adresas) {
      if (!validateAddressValue(v)) {
        setError(input, "Įveskite adresą");
        return false;
      }
    }
    // telefono validacija bus atskirai (2 užduotis), čia tik check not-empty
    setSuccess(input);
    return true;
  }

  // attach input events
  [vardas, pavarde, email, adresas].forEach(inp => {
    if (!inp) return;
    inp.addEventListener("input", function () {
      liveValidate(inp);
      checkFormValidity();
    });
  });

  // sliders - optional: mark success when used
  sliders.forEach(s => {
    if (!s) return;
    s.addEventListener("input", () => {
      // treat as filled
      const parent = s.closest(".form-group") || ensureFormGroup(s);
      parent.classList.add("success");
      checkFormValidity();
    });
  });

  function checkFormValidity() {
    // all required fields valid and sliders exist
    const basic = [vardas, pavarde, email, adresas].every(i => i && i.closest(".form-group") && i.closest(".form-group").classList.contains("success"));
    const slidersOk = sliders.every(s => s && s.value !== "");
    // phone not required for initial activation (per earlier spec phone validated in step 2) -> but user asked earlier to exclude phone from initial validation; however we included phone formatting separately. For enabling submit we require phone not empty as well.
    const phoneFilled = telefonas && telefonas.value.trim() !== "";
    submitBtn.disabled = !(basic && slidersOk && phoneFilled);
  }

  // phone formatting: allow only digits input and autoformat to +370 6xx xxxxx
  if (telefonas) {
    telefonas.addEventListener("input", function () {
      let numbers = this.value.replace(/\D/g, "");
      // handle leading 8 or 370 or 0
      if (numbers.startsWith("370")) numbers = numbers.slice(3);
      if (numbers.startsWith("8")) numbers = numbers.slice(1);
      if (numbers.startsWith("0")) numbers = numbers.slice(1);

      numbers = numbers.slice(0, 8); // 8 digits for 6xx xxxxx

      let formatted = "";
      if (numbers.length === 0) {
        formatted = "";
      } else {
        formatted = "+370 ";
        // ensure first digit is 6; if user typed other, keep as is but still format
        if (numbers.length >= 1) formatted += numbers[0];
        if (numbers.length >= 2) formatted += numbers.slice(1, 3);
        if (numbers.length >= 3) formatted += " " + numbers.slice(3);
      }
      this.value = formatted.trim();
      // mark success if some digits present (more robust validation could be added)
      const group = this.closest(".form-group");
      if (numbers.length >= 7) {
        group && group.classList.add("success");
        group && group.classList.remove("error");
      } else {
        // do not force error; but for enabling submit we require phoneFilled above
        // optionally show partial style
        if (numbers.length === 0) {
          group && group.classList.remove("success");
        }
      }
      checkFormValidity();
    });
  }

  // form submit handling
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
      vardas: vardas ? vardas.value.trim() : "",
      pavarde: pavarde ? pavarde.value.trim() : "",
      email: email ? email.value.trim() : "",
      telefonas: telefonas ? telefonas.value.trim() : "",
      adresas: adresas ? adresas.value.trim() : "",
      vertinimas1: sliders[0] ? Number(sliders[0].value) : 0,
      vertinimas2: sliders[1] ? Number(sliders[1].value) : 0,
      vertinimas3: sliders[2] ? Number(sliders[2].value) : 0
    };

    // vidurkis
    const avg = ((formData.vertinimas1 + formData.vertinimas2 + formData.vertinimas3) / 3).toFixed(1);

    console.log("Formos duomenys:", formData);

    resultBox.innerHTML = `
      <h4>Įvesti duomenys:</h4>
      <p><strong>Vardas:</strong> ${formData.vardas}</p>
      <p><strong>Pavardė:</strong> ${formData.pavarde}</p>
      <p><strong>El. paštas:</strong> ${formData.email}</p>
      <p><strong>Tel. numeris:</strong> ${formData.telefonas}</p>
      <p><strong>Adresas:</strong> ${formData.adresas}</p>
      <hr>
      <h4>${formData.vardas} ${formData.pavarde}: ${avg}</h4>
    `;
    popup.classList.add("show");
    setTimeout(() => popup.classList.remove("show"), 3000);

    // reset form visuals but keep values cleared
    form.reset();
    submitBtn.disabled = true;
    document.querySelectorAll(".form-group").forEach(g => g.classList.remove("success"));
  });

  /* ============================
     ========== GAME ===========
     ============================ */

  // Dataset of at least 12 unique items (emojis) to cover both modes
  const CARD_SET = ["🐶","🐱","🦊","🦁","🐼","🐵","🐸","🐯","🐨","🦄","🦉","🐙"];

  const gridEl = document.getElementById("game-grid");
  const movesEl = document.getElementById("moves-count");
  const matchedEl = document.getElementById("matched-count");
  const winMsgEl = document.getElementById("win-message");
  const startBtn = document.getElementById("game-start");
  const resetBtn = document.getElementById("game-reset");
  const difficultyRadios = Array.from(document.querySelectorAll("input[name='difficulty']"));

  let state = {
    cols: 4,
    rows: 3,
    totalCards: 12,
    deck: [],
    firstCard: null,
    secondCard: null,
    lockBoard: false,
    moves: 0,
    matches: 0,
    requiredPairs: 6
  };

  // Utility: shuffle array
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length -1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function setDifficulty(mode) {
    if (mode === "easy") {
      state.cols = 4; state.rows = 3; state.totalCards = 12; state.requiredPairs = 6;
    } else {
      state.cols = 6; state.rows = 4; state.totalCards = 24; state.requiredPairs = 12;
    }
    // set grid data attribute for CSS
    gridEl.setAttribute("data-cols", state.cols.toString());
  }

  // build deck: pick requiredPairs unique elements from CARD_SET, duplicate and shuffle
  function buildDeck() {
    const need = state.requiredPairs;
    if (need > CARD_SET.length) {
      console.warn("Not enough unique cards in dataset; duplicating.");
    }
    // pick first `need` items
    const selected = CARD_SET.slice(0, need);
    const pairs = selected.concat(selected); // duplicate
    const deck = shuffle(pairs);
    return deck;
  }

  // render grid
  function renderGrid() {
    gridEl.innerHTML = "";
    state.deck.forEach((val, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.index = idx;
      card.dataset.value = val;

      const inner = document.createElement("div");
      inner.className = "card-inner";

      const back = document.createElement("div");
      back.className = "card-face card-back";
      back.innerHTML = `<span aria-hidden="true" style="font-size:22px;">?</span>`;

      const front = document.createElement("div");
      front.className = "card-face card-front";
      front.innerHTML = `<span class="card-value">${val}</span>`;

      inner.appendChild(back);
      inner.appendChild(front);
      card.appendChild(inner);

      // click handler
      card.addEventListener("click", onCardClick);

      gridEl.appendChild(card);
    });

    // set CSS grid columns via attribute already done in setDifficulty
  }

  function resetState() {
    state.firstCard = null;
    state.secondCard = null;
    state.lockBoard = false;
    state.moves = 0;
    state.matches = 0;
    movesEl.textContent = "0";
    matchedEl.textContent = "0";
    winMsgEl.style.display = "none";
    winMsgEl.textContent = "";
  }

  function startGame() {
    // build new deck, render
    state.deck = buildDeck();
    resetState();
    renderGrid();
  }

  function revealCard(cardEl) {
    if (!cardEl) return;
    if (state.lockBoard) return;
    if (cardEl.classList.contains("flipped") || cardEl.classList.contains("matched")) return;

    cardEl.classList.add("flipped");

    if (!state.firstCard) {
      state.firstCard = cardEl;
      return;
    }

    state.secondCard = cardEl;
    state.lockBoard = true;
    // count move
    state.moves += 1;
    movesEl.textContent = state.moves;

    // check match
    const v1 = state.firstCard.dataset.value;
    const v2 = state.secondCard.dataset.value;

    if (v1 === v2) {
      // match
      state.firstCard.classList.add("matched");
      state.secondCard.classList.add("matched");
      state.matches += 1;
      matchedEl.textContent = state.matches;
      // reset picks
      state.firstCard = null;
      state.secondCard = null;
      state.lockBoard = false;

      // check win
      if (state.matches === state.requiredPairs) {
        onWin();
      }
    } else {
      // not match -> flip back after ~1s
      setTimeout(() => {
        state.firstCard.classList.remove("flipped");
        state.secondCard.classList.remove("flipped");
        state.firstCard = null;
        state.secondCard = null;
        state.lockBoard = false;
      }, 900);
    }
  }

function onCardClick(e) {
  if (!gameStarted) return;

  const cardEl = e.currentTarget;
  revealCard(cardEl);
}


  function onWin() {
    winMsgEl.style.display = "block";
    winMsgEl.textContent = "🎉 Laimėjote! Puikiai atlikta!";
    // also show success popup briefly
    popup.textContent = "🎉 Laimėjote žaidimą!";
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
      popup.textContent = "✅ Duomenys pateikti sėkmingai!";
    }, 2200);
  }

  // handle difficulty change
  difficultyRadios.forEach(r => {
    r.addEventListener("change", () => {
      setDifficulty(r.value);
      // on change, reset and render blank grid (cards hidden)
      state.deck = buildDeck();
      resetState();
      renderGrid();
    });
  });

let gameStarted = false;   // <-- PRIDĖKITE VIRŠUJE PRIE GAME STATE

startBtn.addEventListener("click", () => {
  if (gameStarted) return;   // neleidžia startinti iš naujo

  const selected = document.querySelector("input[name='difficulty']:checked").value;
  setDifficulty(selected);
  state.deck = buildDeck();
  resetState();
  renderGrid();

  gameStarted = true;
});



resetBtn.addEventListener("click", () => {
  const selected = document.querySelector("input[name='difficulty']:checked").value;
  setDifficulty(selected);
  state.deck = buildDeck();
  resetState();
  renderGrid();

  gameStarted = true;  // leidžia iškart tęsti žaidimą
});


  // initialize default board (easy)
  setDifficulty("easy");
  state.deck = buildDeck();
  renderGrid();

});
