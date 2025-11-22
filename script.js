const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const audio = document.getElementById("music");
const startBtn = document.getElementById("start");
const message = document.getElementById("message");
const replayBtn = document.getElementById("replay");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let analyser, dataArray, audioContext;
let particles = [];
const totalParticles = 600;

// fórmula coração
function heartFormula(t) {
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
    return { x, y };
}

function resetParticles() {
    particles = [];
    for (let i = 0; i < totalParticles; i++) {
        const a = Math.random() * Math.PI * 2;
        const pos = heartFormula(a);

        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            tx: canvas.width / 2 + pos.x * 15,
            ty: canvas.height / 2 + pos.y * 15,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.05 + 0.03
        });
    }
}

resetParticles();

// animação
function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const pulse = (volume / 140) + 0.7;

    let formed = true;

    particles.forEach(p => {
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;

        if (Math.abs(p.x - p.tx) > 3 || Math.abs(p.y - p.ty) > 3) formed = false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Math.random()*20+320},100%,50%)`;
        ctx.fill();
    });

    if (formed) {
        message.style.opacity = 1;
        replayBtn.style.display = "block";
    }
}

startBtn.addEventListener("click", async () => {
    startBtn.style.display = "none";

    // Criar AudioContext APÓS interação humana (obrigatório)
    if (!audioContext) audioContext = new AudioContext();

    const source = audioContext.createMediaElementSource(audio);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audio.volume = 1.0;

    audio.play().catch(err => {
        alert("⚠️ Clique novamente — o navegador bloqueou o áudio.");
        console.warn(err);
    });

    animate();
});

replayBtn.addEventListener("click", () => {
    message.style.opacity = 0;
    replayBtn.style.display = "none";
    audio.currentTime = 0;
    resetParticles();

    audio.play().catch(() => {});
});
