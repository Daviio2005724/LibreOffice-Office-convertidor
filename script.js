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

/*
CONFIGURACIÓN DE FORMATOS

 
Cada extensión de LibreOffice
tiene su equivalente de Microsoft Office.
 

*/

const formats = {

 
odt: {
    output: "docx",
    inputName: "Writer",
    outputName: "Word"
},

ods: {
    output: "xlsx",
    inputName: "Calc",
    outputName: "Excel"
},

odp: {
    output: "pptx",
    inputName: "Impress",
    outputName: "PowerPoint"
}
 

};

/*
SELECCIONAR ARCHIVO
*/

fileInput.addEventListener("change", function () {

     
if (this.files.length === 0) {
    return;
}

processFile(this.files[0]);
 

});

/*
DRAG & DROP
*/

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

if (files.length === 0) {
    return;
}

processFile(files[0]);
 

});

/*
PROCESAR ARCHIVO
*/

function processFile(file) {

     
resetMessages();

const extension = getExtension(file.name);

if (!formats[extension]) {

    showError(
        "Formato no compatible. Solo puedes cargar archivos ODT, ODS u ODP."
    );

    return;
}

selectedFile = file;

const format = formats[extension];


/*
    INFORMACIÓN DEL ARCHIVO
*/

fileName.textContent = file.name;

fileSize.textContent = formatFileSize(file.size);


/*
    INFORMACIÓN DE CONVERSIÓN
*/

inputFormat.textContent = extension.toUpperCase();
inputName.textContent = format.inputName;

outputFormat.textContent = format.output.toUpperCase();
outputName.textContent = format.outputName;


/*
    ICONO
*/

if (extension === "odt") {
    fileIcon.textContent = "📄";
}

if (extension === "ods") {
    fileIcon.textContent = "📊";
}

if (extension === "odp") {
    fileIcon.textContent = "📽️";
}


/*
    MOSTRAR ELEMENTOS
*/

fileInfo.hidden = false;
conversion.hidden = false;

convertButton.disabled = false;

result.hidden = true;
 

}

/*
OBTENER EXTENSIÓN
*/

function getExtension(filename) {

     
return filename
    .split(".")
    .pop()
    .toLowerCase();
 

}

/*
FORMATEAR TAMAÑO
*/

function formatFileSize(bytes) {

     
if (bytes < 1024) {
    return bytes + " B";
}

if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
}

return (bytes / (1024 * 1024)).toFixed(1) + " MB";
 

}

/*
ELIMINAR ARCHIVO
*/

removeButton.addEventListener("click", function () {

     
selectedFile = null;

fileInput.value = "";

fileInfo.hidden = true;
conversion.hidden = true;

convertButton.disabled = true;

progressContainer.hidden = true;
result.hidden = true;

resetMessages();
 

});

/*
CONVERTIR

 
Actualmente es una simulación visual.

Después conectaremos este botón
con el backend que ejecutará LibreOffice.
 

*/

convertButton.addEventListener("click", function () {

     
if (!selectedFile) {
    return;
}

convertButton.disabled = true;

progressContainer.hidden = false;

result.hidden = true;

let percentage = 0;

const interval = setInterval(function () {

    percentage += 5;

    progress.style.width = percentage + "%";

    progressPercent.textContent = percentage + "%";


    if (percentage >= 100) {

        clearInterval(interval);

        conversionFinished();

    }

}, 100);
 

});

/*
FINALIZAR CONVERSIÓN
*/

function conversionFinished() {

     
const extension = getExtension(selectedFile.name);

const outputExtension = formats[extension].output;

const originalName = selectedFile.name
    .substring(
        0,
        selectedFile.name.lastIndexOf(".")
    );

const convertedName =
    originalName + "." + outputExtension;


resultText.textContent =
    convertedName + " está listo para descargar.";


result.hidden = false;

convertButton.disabled = false;


/*
    IMPORTANTE:

    Por ahora no podemos crear realmente
    DOCX/XLSX/PPTX desde el navegador.

    Este botón quedará preparado para
    recibir posteriormente el archivo
    generado por el servidor.
*/

downloadButton.onclick = function () {

    showError(
        "La conversión real todavía necesita conectarse al servidor."
    );

};
 

}

/*
MOSTRAR ERROR
*/

function showError(message) {

     
errorText.textContent = message;

error.hidden = false;
 

}

/*
LIMPIAR MENSAJES
*/

function resetMessages() {

     
error.hidden = true;
 

}
