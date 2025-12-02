document.addEventListener("DOMContentLoaded", function () {

  const form = document.querySelector(".php-email-form");
  const submitBtn = form.querySelector("button[type='submit']");

  const vardas = form.querySelector("input[name='vardas']");
  const pavarde = form.querySelector("input[name='pavarde']");
  const email = form.querySelector("input[name='email']");
  const telefonas = form.querySelector("input[name='telefonas']");
  const adresas = form.querySelector("input[name='adresas']");

  const vertinimas1 = form.querySelector("input[name='vertinimas1']");
  const vertinimas2 = form.querySelector("input[name='vertinimas2']");
  const vertinimas3 = form.querySelector("input[name='vertinimas3']");

  const fields = [vardas, pavarde, email, adresas];

  // ✅ Realio laiko validacija
  function setError(input, message) {
    const group = input.closest(".form-group");
    group.classList.add("error");
    group.classList.remove("success");
    group.querySelector(".form-error").textContent = message;
  }

  function setSuccess(input) {
    const group = input.closest(".form-group");
    group.classList.remove("error");
    group.classList.add("success");
    group.querySelector(".form-error").textContent = "";
  }

  function validateName(input) {
    return /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s]+$/.test(input.value.trim());
  }

  function validateEmail(input) {
    return /^\S+@\S+\.\S+$/.test(input.value.trim());
  }

  function validateAddress(input) {
    return input.value.trim().length > 3;
  }

  function liveValidate(input) {
    if (input.value.trim() === "") {
      setError(input, "Laukas negali būti tuščias");
      return false;
    }

    if (input === vardas || input === pavarde) {
      if (!validateName(input)) {
        setError(input, "Tik raidės");
        return false;
      }
    }

    if (input === email) {
      if (!validateEmail(input)) {
        setError(input, "Neteisingas el. paštas");
        return false;
      }
    }

    if (input === adresas) {
      if (!validateAddress(input)) {
        setError(input, "Įveskite adresą");
        return false;
      }
    }

    setSuccess(input);
    return true;
  }

  // ✅ Pridedame input event realio laiko validacijai
  fields.forEach(input => {
    input.addEventListener("input", function () {
      liveValidate(input);
      checkFormValidity();
    });
  });

  // ✅ Patikriname ar visi laukeliai teisingi
  function checkFormValidity() {
    const allValid = fields.every(input =>
      input.closest(".form-group").classList.contains("success")
    );
    submitBtn.disabled = !allValid;
  }

  // ✅ Telefono formatavimas +370 6xx xxxxx
  telefonas.addEventListener("input", function () {
    let numbers = this.value.replace(/\D/g, "");

    if (numbers.startsWith("370")) numbers = numbers.slice(3);
    if (numbers.startsWith("8")) numbers = numbers.slice(1);

    numbers = numbers.slice(0, 8);

    let result = "+370 ";
    if (numbers.length > 0) result += "6";
    if (numbers.length > 1) result += numbers.slice(1, 3);
    if (numbers.length > 3) result += " " + numbers.slice(3);

    this.value = result.trim();
  });

  // ✅ Range input vertės atvaizdavimas šalia sliderio
  [vertinimas1, vertinimas2, vertinimas3].forEach(input => {
    const span = input.nextElementSibling;
    input.addEventListener("input", () => {
      span.textContent = input.value;
    });
  });

  // ✅ Submit funkcija
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Surenkame duomenis į objektą
    const formData = {
      vardas: vardas.value.trim(),
      pavarde: pavarde.value.trim(),
      email: email.value.trim(),
      telefonas: telefonas.value.trim(),
      adresas: adresas.value.trim(),
      vertinimas1: Number(vertinimas1.value),
      vertinimas2: Number(vertinimas2.value),
      vertinimas3: Number(vertinimas3.value)
    };

    // 1️⃣ Console Log
    console.log(formData);

    // 2️⃣ Atvaizdavimas svetainėje
    const outputDiv = document.getElementById("form-output");
    const vidurkis = ((formData.vertinimas1 + formData.vertinimas2 + formData.vertinimas3)/3).toFixed(1);

    outputDiv.innerHTML = `
      <p><strong>Vardas:</strong> ${formData.vardas}</p>
      <p><strong>Pavardė:</strong> ${formData.pavarde}</p>
      <p><strong>El. paštas:</strong> ${formData.email}</p>
      <p><strong>Tel. numeris:</strong> ${formData.telefonas}</p>
      <p><strong>Adresas:</strong> ${formData.adresas}</p>
      <p><strong>Vertinimas 1:</strong> ${formData.vertinimas1}</p>
      <p><strong>Vertinimas 2:</strong> ${formData.vertinimas2}</p>
      <p><strong>Vertinimas 3:</strong> ${formData.vertinimas3}</p>
      <p><strong>Vidurkis:</strong> ${formData.vardas} ${formData.pavarde}: ${vidurkis}</p>
    `;

    // 3️⃣ Pop-up pranešimas sėkmingam pateikimui
    const popup = document.getElementById("success-popup");
    popup.classList.add("show");
    setTimeout(() => {
      popup.classList.remove("show");
    }, 3000);

    // 4️⃣ Išvalome formą ir mygtuką
    form.reset();
    submitBtn.disabled = true;
    document.querySelectorAll(".form-group").forEach(g => {
      g.classList.remove("success");
      g.classList.remove("error");
      g.querySelector(".form-error").textContent = "";
    });

    // Reset range vertės atvaizdavimą
    [vertinimas1, vertinimas2, vertinimas3].forEach(input => {
      input.nextElementSibling.textContent = input.value;
    });
  });

});
