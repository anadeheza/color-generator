const genBtn = document.getElementById('generate-btn')
const colorCards = document.getElementById('color-card')
const toast = document.getElementById('toast')

function generateColor() {
    const hexChars = '0123456789ABCDEF'
    let color = '#'
    for(let i = 0; i < 6; i++) {
        color += hexChars[Math.floor(Math.random() * 16)]
    }

    return color 
}

function updatePalette() {
    colorCards.forEach(card => {
        const randColor = generateColor()
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

genBtn.addEventListener('click', updatePalette) 

window.addEventListener('keydown', (e) => {
    const codigo = e.code
    if(codigo === 'Space' || codigo === 'Enter') {
        e.preventDefault()
        updatePalette()
    }
})

updatePalette()