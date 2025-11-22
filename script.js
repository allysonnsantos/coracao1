const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("music");
const startBtn = document.getElementById("start");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext, analyser, dataArray;
let particles = [];
const totalParticles = 1600;

// --- Função coração preenchido ---
function insideHeart(x, y) {
    return Math.pow(x*x + y*y - 1, 3) - x*x*Math.pow(y, 3) <= 0;
}

// --- Criar partículas ---
function generateParticles() {
    particles = [];
    const scale = Math.min(canvas.width, canvas.height) * 0.12; // escala automática

    let attempts = 0; // segurança para não travar

    while (particles.length < totalParticles && attempts < totalParticles * 10) {
        attempts++;

        const x = (Math.random() * 2 - 1) * 1.4; 
        const y = (Math.random() * 2 - 1) * 1.4;

        if (insideHeart(x, y)) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                tx: canvas.width / 2 + x * scale,
                ty: canvas.height / 2 - y * scale,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.02 + 0.01
            });
        }
    }
}

generateParticles();

// --- Loop de animação ---
function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const pulse = 1 + (volume / 150);

    particles.forEach(p => {
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${330 + Math.random()*20},100%,60%)`;
        ctx.fill();
    });
}

startBtn.addEventListener("click", async () => {
    startBtn.style.display = "none";

    if (!audioContext) audioContext = new AudioContext();

    const source = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audio.play().catch(() => {
        alert("Clique novamente, o navegador bloqueou o áudio.");
    });

    animate();
});
