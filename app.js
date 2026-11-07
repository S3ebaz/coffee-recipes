// Coffee Recipes AI - Vanilla JS
// Handles image upload (gallery or camera), OpenAI Vision analysis, and GitHub publish

const GITHUB_OWNER = 'S3ebaz';
const GITHUB_REPO = 'coffee-recipes';
const GITHUB_BRANCH = 'main';

// DOM Elements
const packagingInput = document.getElementById('packagingInput');
const packagingCamera = document.getElementById('packagingCamera');
const recipeInput = document.getElementById('recipeInput');
const recipeCamera = document.getElementById('recipeCamera');
const packagingPreview = document.getElementById('packagingPreview');
const recipePreview = document.getElementById('recipePreview');
const packagingZone = document.getElementById('packagingZone');
const recipeZone = document.getElementById('recipeZone');

const analyzeBtn = document.getElementById('analyzeBtn');
const loadingDiv = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const techSheetDiv = document.getElementById('techSheet');
const optimizedRecipeDiv = document.getElementById('optimizedRecipe');
const publishBtn = document.getElementById('publishBtn');
const publishStatus = document.getElementById('publishStatus');

let packagingFile = null;
let recipeFile = null;
let currentAnalysis = null;

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

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Analyze (requires OpenAI key in localStorage for now)
analyzeBtn.addEventListener('click', async () => {
  const apiKey = localStorage.getItem('openai_key');
  if (!apiKey) {
    alert('Necesitas una OpenAI API Key. Guárdala en localStorage con la clave \"openai_key\".');
    return;
  }
  if (!packagingFile && !recipeFile) {
    alert('Sube o toma al menos una foto.');
    return;
  }

  analyzeBtn.disabled = true;
  loadingDiv.classList.remove('hidden');
  resultsSection.classList.add('hidden');

  try {
    const messages = [
      {
        role: 'system',
        content: `Eres un Barista Master certificado por la SCA. Analiza las imágenes de empaque de café y/o método de extracción.\nResponde SOLO en JSON válido con esta estructura exacta:\n{\n  \"ficha_tecnica\": { \"marca\": \"\", \"origen\": \"\", \"tueste\": \"\", \"notas_de_cata\": [], \"ratio_estimado\": \"\", \"temperatura\": \"\", \"molienda\": \"\", \"tiempo_extraccion\": \"\", \"observaciones\": \"\" },\n  \"receta_optimizada\": { \"titulo\": \"\", \"metodo\": \"\", \"dosis_cafe_g\": \"\", \"agua_ml\": \"\", \"ratio\": \"\", \"temperatura_c\": \"\", \"molienda\": \"\", \"tiempo_total\": \"\", \"pasos\": [], \"consejos_aroma\": \"\", \"equilibrio_sabor\": \"\" }\n}`
      },
      {
        role: 'user',
        content: [{ type: 'text', text: 'Analiza estas imágenes de café y genera la ficha y receta optimizada.' }]
      }
    ];

    const userContent = messages[1].content;
    if (packagingFile) {
      const b64 = await fileToBase64(packagingFile);
      userContent.push({ type: 'image_url', image_url: { url: `data:${packagingFile.type};base64,${b64}` } });
    }
    if (recipeFile) {
      const b64 = await fileToBase64(recipeFile);
      userContent.push({ type: 'image_url', image_url: { url: `data:${recipeFile.type};base64,${b64}` } });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 1500,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Error en la API de OpenAI');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    currentAnalysis = JSON.parse(content);

    renderResults(currentAnalysis);
    resultsSection.classList.remove('hidden');
  } catch (err) {
    alert('Error al analizar: ' + err.message);
    console.error(err);
  } finally {
    analyzeBtn.disabled = false;
    loadingDiv.classList.add('hidden');
  }
});

function renderResults(analysis) {
  const f = analysis.ficha_tecnica || {};
  techSheetDiv.innerHTML = `
    <h3>Información del Café</h3>
    <ul>
      <li><strong>Marca:</strong> ${f.marca || 'N/A'}</li>
      <li><strong>Origen:</strong> ${f.origen || 'N/A'}</li>
      <li><strong>Tueste:</strong> ${f.tueste || 'N/A'}</li>
      <li><strong>Notas de cata:</strong> ${(f.notas_de_cata || []).join(', ') || 'N/A'}</li>
    </ul>
    <h3>Análisis de Extracción Actual</h3>
    <ul>
      <li><strong>Ratio estimado:</strong> ${f.ratio_estimado || 'N/A'}</li>
      <li><strong>Temperatura:</strong> ${f.temperatura || 'N/A'}</li>
      <li><strong>Molienda:</strong> ${f.molienda || 'N/A'}</li>
      <li><strong>Tiempo:</strong> ${f.tiempo_extraccion || 'N/A'}</li>
    </ul>
    <p><strong>Observaciones:</strong> ${f.observaciones || 'Sin observaciones'}</p>
  `;

  const r = analysis.receta_optimizada || {};
  optimizedRecipeDiv.innerHTML = `
    <h3>${r.titulo || 'Receta Optimizada'}</h3>
    <p><strong>Método:</strong> ${r.metodo || 'N/A'}</p>
    <ul>
      <li><strong>Dosis de café:</strong> ${r.dosis_cafe_g || 'N/A'} g</li>
      <li><strong>Agua:</strong> ${r.agua_ml || 'N/A'} ml</li>
      <li><strong>Ratio:</strong> ${r.ratio || 'N/A'}</li>
      <li><strong>Temperatura:</strong> ${r.temperatura_c || 'N/A'} °C</li>
      <li><strong>Molienda:</strong> ${r.molienda || 'N/A'}</li>
      <li><strong>Tiempo total:</strong> ${r.tiempo_total || 'N/A'}</li>
    </ul>
    <h4>Pasos:</h4>
    <ol>${(r.pasos || []).map(p => `<li>${p}</li>`).join('')}</ol>
    <p><strong>Consejos para aroma:</strong> ${r.consejos_aroma || ''}</p>
    <p><strong>Equilibrio de sabor:</strong> ${r.equilibrio_sabor || ''}</p>
  `;
}

// Publish to GitHub
publishBtn.addEventListener('click', async () => {
  if (!currentAnalysis) {
    alert('Primero analiza una receta.');
    return;
  }
  const token = localStorage.getItem('github_pat');
  if (!token) {
    alert('Necesitas un GitHub PAT. Guárdalo en localStorage con la clave \"github_pat\".');
    return;
  }

  publishBtn.disabled = true;
  publishStatus.innerHTML = '<span class="text-amber-700">Publicando...</span>';

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `recetas/receta-${timestamp}.md`;
    const mdContent = generateMarkdown(currentAnalysis);
    const base64Content = btoa(unescape(encodeURIComponent(mdContent)));

    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filename}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Add coffee recipe ${timestamp}`,
        content: base64Content,
        branch: GITHUB_BRANCH
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Error al publicar en GitHub');
    }

    const result = await response.json();
    publishStatus.innerHTML = `<div class="alert-success">✅ Receta publicada: <a href="${result.content.html_url}" target="_blank" class="underline">${filename}</a></div>`;
  } catch (err) {
    publishStatus.innerHTML = `<div class="alert-error">❌ Error: ${err.message}</div>`;
    console.error(err);
  } finally {
    publishBtn.disabled = false;
  }
});

function generateMarkdown(analysis) {
  const f = analysis.ficha_tecnica || {};
  const r = analysis.receta_optimizada || {};
  return `# ${r.titulo || 'Receta de Café Optimizada'}

## Ficha Técnica
- **Marca:** ${f.marca || 'N/A'}
- **Origen:** ${f.origen || 'N/A'}
- **Tueste:** ${f.tueste || 'N/A'}
- **Notas de cata:** ${(f.notas_de_cata || []).join(', ') || 'N/A'}
- **Ratio estimado:** ${f.ratio_estimado || 'N/A'}
- **Temperatura:** ${f.temperatura || 'N/A'}
- **Molienda:** ${f.molienda || 'N/A'}
- **Tiempo:** ${f.tiempo_extraccion || 'N/A'}

### Observaciones
${f.observaciones || 'Sin observaciones'}

## Receta Optimizada
- **Método:** ${r.metodo || 'N/A'}
- **Dosis café:** ${r.dosis_cafe_g || 'N/A'} g
- **Agua:** ${r.agua_ml || 'N/A'} ml
- **Ratio:** ${r.ratio || 'N/A'}
- **Temperatura:** ${r.temperatura_c || 'N/A'} °C
- **Molienda:** ${r.molienda || 'N/A'}
- **Tiempo total:** ${r.tiempo_total || 'N/A'}

### Pasos
${(r.pasos || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

### Consejos de Aroma
${r.consejos_aroma || ''}

### Equilibrio de Sabor
${r.equilibrio_sabor || ''}

---
*Generado automáticamente con Coffee Recipes AI*
`;
}

console.log('Coffee Recipes AI listo ☕');
