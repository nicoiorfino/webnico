function toggleDropdown(id) {
  const target = document.getElementById(id)
  if (!target) return

  // Close other dropdowns
  const allDropdowns = Array.from(document.querySelectorAll('.dropdown-content'))
  allDropdowns.forEach(d => {
    if (d === target) d.classList.toggle('active')
    else d.classList.remove('active')
  })

  // Update toggle buttons' active state (match onclick attribute)
  const allToggles = Array.from(document.querySelectorAll('.dropdown-toggle'))
  allToggles.forEach(btn => {
    const onclick = btn.getAttribute('onclick') || ''
    if (onclick.includes(`'${id}'`) || onclick.includes(`\"${id}\"`)) {
      btn.classList.toggle('active', target.classList.contains('active'))
    } else {
      btn.classList.remove('active')
    }
  })
}

// -------------------- Modern emoji rendering (separate scope) --------------------
;(function(){
  // Generate a modern SVG badge for an emoji character
  function createModernEmojiSVG(emoji, size){
    const id = 'g'+Math.random().toString(36).slice(2,9)
    const grad1 = '#00ffff'
    const grad2 = '#00cccc'
    const shadow = 'rgba(0,0,0,0.45)'
    const s = size
    const fontSize = Math.floor(s*0.55)
    return `
      <svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${emoji}">
        <defs>
          <linearGradient id="g-${id}" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="${grad1}" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="${grad2}" stop-opacity="0.95"/>
          </linearGradient>
          <filter id="f-${id}" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="${shadow}" flood-opacity="0.6" />
          </filter>
        </defs>
        <rect x="0" y="0" width="${s}" height="${s}" rx="12" fill="url(#g-${id})" filter="url(#f-${id})" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="${fontSize}px" font-family="Segoe UI Emoji, Noto Color Emoji, Apple Color Emoji, sans-serif">${emoji}</text>
      </svg>`
  }

  function renderModernEmojis(){
    document.querySelectorAll('.icon, .icon-large').forEach(el=>{
      const txt = el.textContent.trim()
      if(!txt) return
      const isLarge = el.classList.contains('icon-large')
      const size = isLarge ? 56 : 40
      // replace content with generated SVG
      el.innerHTML = createModernEmojiSVG(txt, size)
      // keep accessible labeling
      el.setAttribute('aria-hidden', 'false')
      el.classList.add('emoji-svg')
    })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderModernEmojis)
  else renderModernEmojis()
})();

// 1. GESTIÓN DE DROPDOWNS
function toggleDropdown(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const allDropdowns = Array.from(document.querySelectorAll('.dropdown-content'));
  allDropdowns.forEach(d => {
    if (d === target) d.classList.toggle('active');
    else d.classList.remove('active');
  });
}

// 2. MONITORIZACIÓN Y REFRESH AUTOMÁTICO (3 MINUTOS)
function startMonitoring() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const url = card.getAttribute('href');
    if (url && url !== "#") {
      checkInternalConnectivity(url, card);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  startMonitoring();
  setInterval(startMonitoring, 180000); 
});

async function checkInternalConnectivity(url, cardElement) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    // Usamos GET para poder leer el cuerpo si es necesario
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timeout);

    // Caso Jira: Status 405 es señal de vida
    if (response.status === 405) {
      updateStatusIndicator(cardElement, true);
      return;
    }

    // Caso Zabbix: Detecta el 502 real
    if (!response.ok) {
      updateStatusIndicator(cardElement, false);
      return;
    }

    // CASO WIKI: Validación de contenido dinámica
    if (url.includes('wiki.danaide.com.ar')) {
        try {
            const htmlText = await response.text();
            // Si el texto contiene el error, va a rojo. Si no, va a VERDE.
            if (htmlText.includes("Fatal exception") || htmlText.includes("RuntimeException")) {
                updateStatusIndicator(cardElement, false);
            } else {
                updateStatusIndicator(cardElement, true);
            }
        } catch (e) {
            // Si no podemos leer el texto por CORS, al menos sabemos que el status fue 200
            updateStatusIndicator(cardElement, true);
        }
    } else {
        // Resto de los sitios (Status 200 = Verde)
        updateStatusIndicator(cardElement, true);
    }

  } catch (e) {
    clearTimeout(timeout);
    
    // Rescate para sitios con bloqueo estricto (Jira/Atlassian)
    if (e.name === 'TypeError') {
      try {
        await fetch(url, { method: "GET", mode: "no-cors", signal: controller.signal });
        updateStatusIndicator(cardElement, true);
      } catch {
        updateStatusIndicator(cardElement, false);
      }
    } else {
      updateStatusIndicator(cardElement, false);
    }
  }
}

function updateStatusIndicator(card, isUp) {
  const dot = card.querySelector('.status-dot');
  if (dot) {
    dot.classList.remove('checking');
    dot.style.backgroundColor = isUp ? "#00ff00" : "#ff0000";
    dot.style.boxShadow = isUp ? "0 0 10px #00ff00" : "0 0 10px #ff0000";
  }
  card.style.opacity = isUp ? "1" : "0.6";
}