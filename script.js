const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("music");
const startBtn = document.getElementById("start");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

let audioContext, analyser, dataArray;
let particles = [];
const totalParticles = 700;

// função curva do coração
function heartPoint(t) {
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x, y };
}

function createParticles() {
    particles = [];

    // escala automática pra tela
    const scale = Math.min(canvas.width, canvas.height) * 0.045;

    for (let i = 0; i < totalParticles; i++) {
        const t = (i / totalParticles) * 2 * Math.PI;
        const p = heartPoint(t);

        particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 400,
            y: canvas.height / 2 + (Math.random() - 0.5) * 400,
            tx: canvas.width / 2 + p.x * scale,
            ty: canvas.height / 2 + p.y * scale,
            size: Math.random() * 2.8 + 1.5,
            speed: Math.random() * 0.035 + 0.02
        });
    }
}

createParticles();

function drawHeart(x, y, size) {
    ctx.fillStyle = "#ff4da3";
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.bezierCurveTo(x - size, y - size, x - size * 2, y + size / 2, x, y + size);
    ctx.bezierCurveTo(x + size * 2, y + size / 2, x + size, y - size, x, y);

    ctx.fill();
}

function animate() {
    requestAnimationFrame(animate);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);
    const beat = (dataArray.reduce((a, b) => a + b) / dataArray.length) / 40 + 1;

    particles.forEach(p => {
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;
        drawHeart(p.x, p.y, p.size * beat);
    });
}

startBtn.onclick = async () => {
    startBtn.style.display = "none";

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();

    const src = audioContext.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(audioContext.destination);

    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    await audio.play();
    animate();
};
