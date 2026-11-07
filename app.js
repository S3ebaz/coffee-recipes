// Coffee Recipes AI - Vanilla JS
// Solo manejo de fotos (galería o cámara) + previsualización

// DOM Elements
const packagingInput = document.getElementById('packagingInput');
const packagingCamera = document.getElementById('packagingCamera');
const recipeInput = document.getElementById('recipeInput');
const recipeCamera = document.getElementById('recipeCamera');
const packagingPreview = document.getElementById('packagingPreview');
const recipePreview = document.getElementById('recipePreview');
const packagingZone = document.getElementById('packagingZone');
const recipeZone = document.getElementById('recipeZone');

let packagingFile = null;
let recipeFile = null;

// Handle select buttons
document.querySelectorAll('.select-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    if (input) input.click();
  });
});

// Setup file inputs
function setupFileInput(input, preview, fileSetter) {
  if (!input) return;
  input.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0], preview, fileSetter);
  });
}

function handleFile(file, preview, fileSetter) {
  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen.');
    return;
  }
  fileSetter(file);
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

// Packaging
setupFileInput(packagingInput, packagingPreview, (f) => packagingFile = f);
setupFileInput(packagingCamera, packagingPreview, (f) => packagingFile = f);

// Recipe
setupFileInput(recipeInput, recipePreview, (f) => recipeFile = f);
setupFileInput(recipeCamera, recipePreview, (f) => recipeFile = f);

// Drag & drop
function setupDragDrop(zone, preview, fileSetter) {
  if (!zone) return;
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], preview, fileSetter);
  });
}

setupDragDrop(packagingZone, packagingPreview, (f) => packagingFile = f);
setupDragDrop(recipeZone, recipePreview, (f) => recipeFile = f);

console.log('Coffee Recipes AI listo ☕ (solo fotos)');
