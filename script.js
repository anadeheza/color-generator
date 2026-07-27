const colorCards = document.querySelectorAll('.color-card')
const toast = document.getElementById('toast')
const relSelect = document.getElementById('relSelect')

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

function generateRelationColors(mode) {
    const baseHue = Math.floor(Math.random() * 360)
    const baseSat = Math.floor(Math.random() * 30) + 50
    const baseLight = Math.floor(Math.random() * 30) + 35 

    const colors = []

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
        colors.push(hslToHex(h, s, l))
    }
    return colors
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

    colorCards.forEach((card, i) => {
        if(card.classList.contains('locked')) return

        const randColor = newColors[i]
        const colorBox = card.querySelector('.color')
        const hexText = card.querySelector('.code')

        colorBox.style.backgroundColor = randColor
        hexText.innerText = randColor
    })
}

function copyColor(card) {

    const hexCode = card.querySelector('.code').innerText

    navigator.clipboard.writeText(hexCode).then(() => {
        toast.classList.add('show')
        setTimeout(() => {
            toast.classList.remove('show')
        }, 1500);
    }).catch(err => {
        console.error('failed to copi :( ->', err)
    })
}

function exportPNG() {
    const canvas = document.createElement('canvas')
    
}

window.addEventListener('keydown', (e) => {
    const codigo = e.code
    if((codigo === 'Space' || codigo === 'Enter') && document.activeElement === relSelect) {
        document.activeElement.blur()
    }

    if(codigo === 'Space' || codigo === 'Enter') {
        e.preventDefault()
        updatePalette()
    }
})

updatePalette()