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

// 1. GESTIÓN DE DROPDOWNS (Tu lógica original unificada)
function toggleDropdown(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const allDropdowns = Array.from(document.querySelectorAll('.dropdown-content'));
  allDropdowns.forEach(d => {
    if (d === target) d.classList.toggle('active');
    else d.classList.remove('active');
  });
}

// 2. LÓGICA DE CONECTIVIDAD AVANZADA (Detecta 502, 404, etc.)
document.addEventListener("DOMContentLoaded", () => {
  // Buscamos todas las tarjetas en tu HTML
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    const url = card.getAttribute('href');
    if (url && url !== "#") {
      checkInternalConnectivity(url, card);
    }
  });
});

async function checkInternalConnectivity(url, cardElement) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // 3 segundos para redes internas

  try {
    // INTENTO 1: Petición estándar para leer response.ok (detecta 502, 404, 500)
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timeout);

    // EXCEPCIÓN PARA JIRA (405): Si es 200 OK o 405 Method Not Allowed, el sitio está vivo.
    // Pero si es 502 (como Zabbix), response.ok es false y el status NO es 405, por lo que va a rojo.
    if (response.ok || response.status === 405) {
      updateStatusIndicator(cardElement, true);
      return;
    } 

    // Si llegó aquí es un error real (502, 504, 500, 404)
    console.warn(`Error detectado en ${url}: Status ${response.status}`);
    updateStatusIndicator(cardElement, false);

  } catch (e) {
    clearTimeout(timeout);

    // Si el error es TypeError, es probable que sea un bloqueo de CORS del navegador
    if (e.name === 'TypeError') {
      // INTENTO 2: Modo no-cors (Ping ciego)
      // No podemos ver si es 502, pero verificamos si la IP/Servidor responde
      try {
        await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal
        });
        updateStatusIndicator(cardElement, true); // El servidor respondió algo
      } catch (innerError) {
        updateStatusIndicator(cardElement, false); // Ni siquiera responde la IP
      }
    } else {
      // Error de Red real o Timeout (Servidor apagado o saturado)
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