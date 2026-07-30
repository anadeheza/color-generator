const colors = document.querySelectorAll('.color-card')
const toast = document.getElementById('toast')
const relSelect = document.getElementById('relSelect')
const codeSelect = document.getElementById('codeSel')
const favList = document.getElementById('favList')

let currentHSL = []

function hslToHex(h, s, l) {
    s /= 100
    l /= 100

    const k = n => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

    const toHex = x => {
        const hex = Math.round(x * 255).toString(16)
        if(hex.length === 1) {
            return '0' + hex
        } else {
            return hex 
        }
    }

    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`.toUpperCase()
}

function hslToRgb(h, s, l) {
    s /= 100 
    l /= 100 
    const k = n => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

    const r = Math.round(f(0) * 255)
    const g = Math.round(f(8) * 255)
    const b = Math.round(f(4) * 255)

    return `rgb(${r}, ${g}, ${b})`
}

function hslText(h, s, l) {
    const h1 = Math.round(h)
    const s1 = Math.round(s)
    const l1 = Math.round(l)

    return `hsl(${h1}°, ${s1}%, ${l1}%)`
}

function hslToSelected(h, s, l) {
    const format = codeSelect.value
    if(format === 'rgb') return hslToRgb(h, s, l)
    if(format === 'hsl') return hslText(h, s, l)
    return hslToHex(h, s, l)
}

function generateRelationColors(mode) {
    const baseHue = Math.floor(Math.random() * 360)
    const baseSat = Math.floor(Math.random() * 30) + 50
    const baseLight = Math.floor(Math.random() * 30) + 35 

    const hslcolors = []

    for(let i = 0; i < 5; i++) {
        let h = baseHue
        let s = baseSat
        let l = baseLight

        switch(mode) {
            case 'analogous':
                h = (baseHue + (i * 15)) % 360
                break
            
            case 'monochromatic':
                l = Math.max(15, Math.min(85, 20 + i * 15))
                break

            case 'complementary':
                h = (i % 2 === 0) ? baseHue : (baseHue + 180) % 360
                l = Math.max(20, Math.min(80, baseLight + (i * 8 - 16)))
                break

            case 'random':
            default:
                h = Math.floor(Math.random() * 360)
                s = Math.floor(Math.random() * 100)
                l = Math.floor(Math.random() * 100)
                break
        }
        hslcolors.push({h, s, l})
    }
    return hslcolors
}

function contrast(card, light) {
    let textColor = '#ffffff'
    let lockBg = 'rgba(255, 255, 255, 0.25)'
    let lockBorder = 'rgba(255, 255, 255, 0.4)'
    if(light > 60) {
        textColor = '#1a1a1a'
        lockBg = 'rgba(0, 0, 0, 0.15)'
        lockBorder = 'rgba(0, 0, 0, 0.2)'
    } 

    const codeText = card.querySelector('.code')
    const lockBtn = card.querySelector('.lock-btn')

    codeText.style.color = textColor
    lockBtn.style.backgroundColor = lockBg
    lockBtn.style.borderColor = lockBorder
}

function toggleLock(event, btn) {
    event.stopPropagation()
    const card = btn.parentElement
    card.classList.toggle('locked')

    if(card.classList.contains('locked')) {
        btn.innerText = '🔒'
    } else {
        btn.innerText = '🔓'
    }
}

function updatePalette() {
    const selectMode = relSelect.value 
    const newColors = generateRelationColors(selectMode)

    colors.forEach((card, i) => {
        if(card.classList.contains('locked')) return

        currentHSL[i] = newColors[i]
        
        const {h, s, l} = currentHSL[i]
        const hexColor = hslToHex(h, s, l)
        const colorBox = card.querySelector('.color')
        const codeText = card.querySelector('.code')

        colorBox.style.backgroundColor = hexColor
        codeText.innerText = hslToSelected(h, s, l)
        contrast(card, l)
    })
}

function changeColorCode() {
    colors.forEach((card, i) => {
        if(!currentHSL[i]) {
            const colorBox = card.querySelector('.color')
            const currentColor = window.getComputedStyle(colorBox).backgroundColor
            const rgbValues = currentColor.match(/\d+/g)

            if(rgbValues) {
                const r = parseInt(rgbValues[0])
                const g = parseInt(rgbValues[1])
                const b = parseInt(rgbValues[2])

                currentHSL[i] = rgbToHsl(r, g, b)
            } else {
                return
            }
        }

        const {h, s, l} = currentHSL[i]
        const codeText = card.querySelector('.code')
        codeText.innerText = hslToSelected(h, s, l)
    })
}

function rgbToHsl(r, g, b) {
    r /= 255 
    g /= 255 
    b /= 255 

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2 

    if(max === min) {
        h = s = 0 
    } else {
        const dif = max - min 
        if(l > 0.5) {
            s = dif / (2 - max - min)
        } else {
            s = dif / (max + min)
        }

        switch(max) {
            case r: h = (g - b) / dif + (g < b? 6 : 0)
            break

            case g: h = (b - r) / dif + 2
            break

            case b: h = (r - g) / dif + 4
            break
        }
        h /= 6
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

function copyColor(card) {

    const colorCode = card.querySelector('.code').innerText

    navigator.clipboard.writeText(colorCode).then(() => {
        toast.classList.add('show')
        setTimeout(() => {
            toast.classList.remove('show')
        }, 1500);
    }).catch(err => {
        console.error('failed to copy :( ->', err)
    })
}

function exportPNG() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const cw = 220
    const ch = 450
    const totalColors = colors.length

    canvas.width = cw * totalColors
    canvas.height = ch 

    colors.forEach((card, i) => {
        const colorCode = card.querySelector('.code').innerText
        const colorBox = card.querySelector('.color')
        const bg = window.getComputedStyle(colorBox).backgroundColor

        ctx.fillStyle = bg 
        ctx.fillRect(i * cw, 0, cw, ch - 70)

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(i * cw, ch - 70, cw, 70)

        ctx.fillStyle = '#333333'
        ctx.font = 'bold 16px "Segoe UI", sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(colorCode, (i * cw) + (cw / 2), ch - 28)
    })

    const link = document.createElement('a')
    link.download = 'color-palette.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
}

function copyCSS() {
    let cssText = ':root {\n'
    colors.forEach((card, i) => {
        const colorCode = card.querySelector('.code').innerText
        cssText += `    --color-${i + 1}: ${colorCode}; \n`
    })
    cssText += '}'

    navigator.clipboard.writeText(cssText).then(() => {
        toast.innerText = "CSS variables copied :)"
        toast.classList.add('show')
        setTimeout(() => {
            toast.classList.remove('show')
            toast.innerText = "Code copied :)"
        }, 1500);
    })
}

function getFavs() {
    return JSON.parse(localStorage.getItem('favPalettes') || '[]')
}

function saveToFav() {
    const favs = getFavs()
    const currentPalette = [...currentHSL]

    const exists = favs.some(fav => JSON.stringify(fav) === JSON.stringify(currentPalette))

    if(exists) {
        toast.innerText = "This palette has already been favourited ;)"
        toast.classList.add('show')
        setTimeout(() => {
            toast.classList.remove('show')
        }, 1500);
        return
    }

    favs.push(currentPalette)
    localStorage.setItem('favPalettes', JSON.stringify(favs))
    renderFavs()
    toast.innerText = "Saved palette ;)"
    toast.classList.add('show')
    setTimeout(() => {
        toast.classList.remove('show')
    }, 1500);
}

function loadFavPalette(i) {
    const favs = getFavs()
    const targetPalette = favs[i]

    if(!targetPalette) return

    colors.forEach(card => {
        card.classList.remove('locked')
        const lockBtn = card.querySelector('.lock-btn')
        if(lockBtn) lockBtn.innerText = '🔓'

    })

    colors.forEach((card, index) => {
        currentHSL[index] = targetPalette[index]
        const {h, s, l} = targetPalette[index]
        const hexColor = hslToHex(h, s, l)
        const colorBox = card.querySelector('.color')
        const codeText = card.querySelector('.code')

        colorBox.style.backgroundColor = hexColor
        codeText.innerText = hslToSelected(h, s, l)
        contrast(card, l)
    })
}

function deleteFav(index) {
    let favs = getFavs() 
    favs.splice(index, 1)
    localStorage.setItem('favPalettes', JSON.stringify(favs))
    renderFavs() 
}

function renderFavs() {
    const favs = getFavs()
    favList.innerHTML =  ''

    if(favs.length === 0) {
        favList.innerHTML = '<p style="color:#888; font-size:14px;">No saved palettes yet :/</p>';
        return;
    }

    favs.forEach((palette, index) => {
        const favCard = document.createElement('div')
        favCard.className = 'fav-card'
        
        let colorBoxesHTML = '<div class="fav-colors">'
        palette.forEach(hsl => {
            const hex = hslToHex(hsl.h, hsl.s, hsl.l)
            colorBoxesHTML += `<div class="fav-color-box" style="background-color: ${hex}"></div>`
        })
        colorBoxesHTML += '</div>';

        favCard.innerHTML = `
            ${colorBoxesHTML}
            <div class="fav-actions">
                <button class="action-btn" onclick="loadFavPalette(${index})">Load</button>
                <button class="action-btn" onclick="deleteFav(${index})" style="color: red;">Delete</button>
            </div>
        `;

        favList.appendChild(favCard)
    });
}

window.addEventListener('keydown', (e) => {
    const codigo = e.code
    const tag = document.activeElement.tagName

    if((codigo === 'Space' || codigo === 'Enter') && document.activeElement === relSelect) {
        document.activeElement.blur()
    }

    if((codigo === 'Space' || codigo === 'Enter') && (tag === 'BUTTON' || tag === 'SELECT')) return

    if(codigo === 'Space' || codigo === 'Enter') {
        e.preventDefault()
        updatePalette()
    }
})

updatePalette()
renderFavs()