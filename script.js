const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");

const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const fileIcon = document.getElementById("fileIcon");

const removeButton = document.getElementById("removeButton");
const conversion = document.getElementById("conversion");

const inputFormat = document.getElementById("inputFormat");
const inputName = document.getElementById("inputName");
const outputFormat = document.getElementById("outputFormat");
const outputName = document.getElementById("outputName");

const convertButton = document.getElementById("convertButton");

const progressContainer = document.getElementById("progressContainer");
const progress = document.getElementById("progress");
const progressPercent = document.getElementById("progressPercent");

const result = document.getElementById("result");
const resultText = document.getElementById("resultText");
const downloadButton = document.getElementById("downloadButton");

const error = document.getElementById("error");
const errorText = document.getElementById("errorText");

let selectedFile = null;
let progressTimer = null;

const formats = {
  odt: { output: "docx", inputName: "Writer", outputName: "Word", icon: "📄" },
  ods: { output: "xlsx", inputName: "Calc", outputName: "Excel", icon: "📊" },
  odp: { output: "pptx", inputName: "Impress", outputName: "PowerPoint", icon: "📽️" }
};

/* SELECCIONAR ARCHIVO */

fileInput.addEventListener("change", function () {
  if (this.files.length === 0) return;
  processFile(this.files[0]);
});

/* DRAG & DROP */

dropZone.addEventListener("dragover", function (event) {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", function () {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", function (event) {
  event.preventDefault();
  dropZone.classList.remove("dragover");

  const files = event.dataTransfer.files;
  if (files.length === 0) return;
  processFile(files[0]);
});

/* PROCESAR ARCHIVO */

function processFile(file) {
  resetMessages();
  stopProgress();
  progressContainer.hidden = true;
  result.hidden = true;

  const extension = getExtension(file.name);
  const format = formats[extension];

  if (!format) {
    showError("Formato no compatible. Solo puedes cargar archivos ODT, ODS u ODP.");
    return;
  }

  selectedFile = file;

  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  inputFormat.textContent = extension.toUpperCase();
  inputName.textContent = format.inputName;
  outputFormat.textContent = format.output.toUpperCase();
  outputName.textContent = format.outputName;

  fileIcon.textContent = format.icon;

  fileInfo.hidden = false;
  conversion.hidden = false;
  convertButton.disabled = false;
}

function getExtension(filename) {
  return filename.split(".").pop().toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/* ELIMINAR ARCHIVO */

removeButton.addEventListener("click", function () {
  selectedFile = null;
  fileInput.value = "";

  stopProgress();
  fileInfo.hidden = true;
  conversion.hidden = true;
  convertButton.disabled = true;
  progressContainer.hidden = true;
  result.hidden = true;

  resetMessages();
});

/* PROGRESO (avanza despacio mientras el servidor trabaja) */

function setProgress(value) {
  progress.style.width = value + "%";
  progressPercent.textContent = Math.round(value) + "%";
}

function startProgress() {
  let value = 5;
  setProgress(value);
  progressTimer = setInterval(function () {
    // Se acerca a 90% pero nunca lo pasa hasta que el servidor responde
    value += (90 - value) * 0.08;
    setProgress(value);
  }, 200);
}

function stopProgress() {
  clearInterval(progressTimer);
  progressTimer = null;
}

/* CONVERTIR */

convertButton.addEventListener("click", async function () {
  if (!selectedFile) return;

  resetMessages();
  convertButton.disabled = true;
  result.hidden = true;
  progressContainer.hidden = false;
  startProgress();

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("/convert", { method: "POST", body: formData });

    if (!response.ok) {
      throw new Error(await response.text() || "Error del servidor");
    }

    const blob = await response.blob();

    const extension = getExtension(selectedFile.name);
    const baseName = selectedFile.name.slice(0, selectedFile.name.lastIndexOf("."));
    const convertedName = baseName + "." + formats[extension].output;

    stopProgress();
    setProgress(100);

    resultText.textContent = convertedName + " está listo para descargar.";
    result.hidden = false;

    downloadButton.onclick = function () {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = convertedName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    };
  } catch (e) {
    stopProgress();
    progressContainer.hidden = true;
    showError("No se pudo convertir el archivo: " + e.message);
  } finally {
    convertButton.disabled = false;
  }
});

/* MENSAJES */

function showError(message) {
  errorText.textContent = message;
  error.hidden = false;
}

function resetMessages() {
  error.hidden = true;
}
