const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("music");
const startBtn = document.getElementById("start");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext, analyser, dataArray;
let particles = [];
const totalParticles = 2000;

// Função que verifica se ponto está dentro do coração sólido
function insideHeart(x, y) {
    const eq = Math.pow(x*x + y*y - 1, 3) - x*x*y*y*y;
    return eq <= 0;
}

// Gerar partículas dentro do coração
function generateFilledHeartParticles() {
    particles = [];

    while (particles.length < totalParticles) {
        // valores entre -1.5 e 1.5
        const x = (Math.random() * 3 - 1.5);
        const y = (Math.random() * 3 - 1.5);

        if (insideHeart(x, y)) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                tx: canvas.width/2 + x * 180,
                ty: canvas.height/2 - y * 180,
                size: Math.random() * 2.5 + 1,
                speed: Math.random() * 0.04 + 0.015
            });
        }
    }
}

generateFilledHeartParticles();

function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "rgba(0,0,0,0.23)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const avg = dataArray.reduce((a,b)=>a+b) / dataArray.length;
    const pulse = (avg / 130) + 0.75;

    particles.forEach(p => {
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${330 + Math.random()*15},100%,60%)`;
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

    audio.play().catch(err => {
        alert("Clique novamente — o navegador bloqueou o áudio.");
    });

    animate();
});
