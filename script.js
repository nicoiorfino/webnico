function toggleDropdown(id) {
  const dropdown = document.getElementById(id)
  const allDropdowns = document.querySelectorAll(".dropdown-content")
  const allToggles = document.querySelectorAll(".dropdown-toggle")

  const icons = {/* preserved earlier small set not needed for modern emojis */}

  // Generate a modern SVG badge for an emoji character (AI-styled)
  function createModernEmojiSVG(emoji, size){
    const id = 'g'+Math.random().toString(36).slice(2,9)
    const grad1 = '#0ff'
    const grad2 = '#00aaff'
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
