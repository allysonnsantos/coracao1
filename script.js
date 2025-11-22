const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const audio = document.getElementById("music");
const startBtn = document.getElementById("start");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audioContext, analyser, dataArray;
let particles = [];
const totalParticles = 1200;

// Fórmula do coração (mais precisa)
function heartPoint(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
    return {x, y};
}

// Criar partículas distribuídas no coração
function generateHeartParticles() {
    particles = [];
    for (let i = 0; i < totalParticles; i++) {
        const t = Math.random() * Math.PI * 2;
        const p = heartPoint(t);

        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            tx: canvas.width/2 + p.x * 15,
            ty: canvas.height/2 - p.y * 15,
            size: Math.random() * 2.2 + 1,
            speed: Math.random() * 0.04 + 0.02
        });
    }
}

generateHeartParticles();

function animate() {
    requestAnimationFrame(animate);

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    analyser.getByteFrequencyData(dataArray);

    const avg = dataArray.reduce((a,b)=>a+b)/dataArray.length;
    const pulse = (avg / 160) + 0.7;

    particles.forEach(p=>{
        p.x += (p.tx - p.x) * p.speed;
        p.y += (p.ty - p.y) * p.speed;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${Math.random()*20+330},100%,60%)`;
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

    audio.play().catch(e=>{
        alert("Clique novamente — o navegador bloqueou o áudio.");
    });

    animate();
});
