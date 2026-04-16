window.requestAnimFrame = (function () {
    return window.requestAnimationFrame;
})();

// Canvas
var canvas = document.getElementById("universe");
var ctx = canvas.getContext("2d");
var cx, cy, rx, ry, rr;
var asteroids = 1800;
var length = 0;
var meteors = [];
var meteor;
var animateUniverse = true;

function executeFrame() {
    if (animateUniverse) {
        requestAnimFrame(executeFrame);
    }
    revolveAsteroids();
    createAsteroids();
}

function activateMeteors() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    cx = canvas.width / 2;
    cy = canvas.height / 2;
    length = canvas.width / 2;

    meteors = [];

    for (var i = 0; i < asteroids; i++) {
        meteor = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            z: Math.random() * canvas.width,
            a: (Math.random() * 0.5 + 0.15).toFixed(2)
        };
        meteors.push(meteor);
    }
}

function revolveAsteroids() {
    for (var i = 0; i < asteroids; i++) {
        meteor = meteors[i];
        meteor.z -= 0.6;

        if (meteor.z <= 0) {
            meteor.z = canvas.width;
        }
    }
}

function drawSky() {
    var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#090909");
    gradient.addColorStop(0.25, "#1a0f0b");
    gradient.addColorStop(0.55, "#2c1412");
    gradient.addColorStop(0.8, "#140c0b");
    gradient.addColorStop(1, "#050505");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // resplandor superior imperial
    var topGlow = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.18, 20,
        canvas.width * 0.5, canvas.height * 0.18, canvas.width * 0.35
    );
    topGlow.addColorStop(0, "rgba(255, 205, 90, 0.16)");
    topGlow.addColorStop(0.45, "rgba(150, 35, 20, 0.14)");
    topGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // luna/sol dorado
    var moonX = canvas.width * 0.78;
    var moonY = canvas.height * 0.18;
    var moon = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 85);
    moon.addColorStop(0, "rgba(255, 238, 180, 0.95)");
    moon.addColorStop(0.25, "rgba(242, 202, 110, 0.90)");
    moon.addColorStop(0.55, "rgba(212, 160, 55, 0.45)");
    moon.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 85, 0, Math.PI * 2);
    ctx.fill();

    // neblina baja
    var fog = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.95, 40,
        canvas.width * 0.5, canvas.height * 0.95, canvas.width * 0.5
    );
    fog.addColorStop(0, "rgba(125, 25, 20, 0.22)");
    fog.addColorStop(0.45, "rgba(90, 12, 12, 0.12)");
    fog.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawStars() {
    for (var i = 0; i < asteroids; i++) {
        meteor = meteors[i];

        rx = (meteor.x - cx) * (length / meteor.z);
        rx += cx;

        ry = (meteor.y - cy) * (length / meteor.z);
        ry += cy;

        rr = 1 * (length / meteor.z);

        ctx.fillStyle = "rgba(255, 227, 170, " + meteor.a + ")";
        ctx.fillRect(rx, ry, rr, rr);
    }
}

function drawMountains() {
    ctx.fillStyle = "rgba(12, 8, 8, 0.95)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height * 0.77);
    ctx.lineTo(canvas.width * 0.08, canvas.height * 0.70);
    ctx.lineTo(canvas.width * 0.16, canvas.height * 0.81);
    ctx.lineTo(canvas.width * 0.27, canvas.height * 0.66);
    ctx.lineTo(canvas.width * 0.38, canvas.height * 0.79);
    ctx.lineTo(canvas.width * 0.50, canvas.height * 0.61);
    ctx.lineTo(canvas.width * 0.62, canvas.height * 0.80);
    ctx.lineTo(canvas.width * 0.72, canvas.height * 0.68);
    ctx.lineTo(canvas.width * 0.84, canvas.height * 0.82);
    ctx.lineTo(canvas.width, canvas.height * 0.73);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(22, 12, 10, 1)";
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height * 0.84);
    ctx.lineTo(canvas.width * 0.12, canvas.height * 0.77);
    ctx.lineTo(canvas.width * 0.24, canvas.height * 0.86);
    ctx.lineTo(canvas.width * 0.35, canvas.height * 0.79);
    ctx.lineTo(canvas.width * 0.48, canvas.height * 0.87);
    ctx.lineTo(canvas.width * 0.62, canvas.height * 0.80);
    ctx.lineTo(canvas.width * 0.75, canvas.height * 0.88);
    ctx.lineTo(canvas.width * 0.88, canvas.height * 0.81);
    ctx.lineTo(canvas.width, canvas.height * 0.86);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
}

function drawCastle() {
    var baseX = canvas.width * 0.5;
    var baseY = canvas.height * 0.63;

    ctx.fillStyle = "rgba(18, 10, 10, 1)";

    // muro principal
    ctx.fillRect(baseX - 140, baseY - 45, 280, 45);

    // torre central
    ctx.fillRect(baseX - 28, baseY - 135, 56, 135);

    // techo torre central
    ctx.beginPath();
    ctx.moveTo(baseX - 40, baseY - 135);
    ctx.lineTo(baseX, baseY - 185);
    ctx.lineTo(baseX + 40, baseY - 135);
    ctx.closePath();
    ctx.fill();

    // almenas muro
    for (var i = -120; i <= 100; i += 40) {
        ctx.fillRect(baseX + i, baseY - 58, 18, 13);
    }

    // torres laterales grandes
    ctx.fillRect(baseX - 120, baseY - 95, 38, 95);
    ctx.fillRect(baseX + 82, baseY - 95, 38, 95);

    ctx.beginPath();
    ctx.moveTo(baseX - 130, baseY - 95);
    ctx.lineTo(baseX - 101, baseY - 135);
    ctx.lineTo(baseX - 72, baseY - 95);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(baseX + 72, baseY - 95);
    ctx.lineTo(baseX + 101, baseY - 135);
    ctx.lineTo(baseX + 130, baseY - 95);
    ctx.closePath();
    ctx.fill();

    // torres externas pequeñas
    ctx.fillRect(baseX - 185, baseY - 70, 28, 70);
    ctx.fillRect(baseX + 157, baseY - 70, 28, 70);

    ctx.beginPath();
    ctx.moveTo(baseX - 192, baseY - 70);
    ctx.lineTo(baseX - 171, baseY - 100);
    ctx.lineTo(baseX - 150, baseY - 70);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(baseX + 150, baseY - 70);
    ctx.lineTo(baseX + 171, baseY - 100);
    ctx.lineTo(baseX + 192, baseY - 70);
    ctx.closePath();
    ctx.fill();

    // puerta
    ctx.fillStyle = "rgba(40, 20, 10, 1)";
    ctx.beginPath();
    ctx.moveTo(baseX - 24, baseY);
    ctx.lineTo(baseX - 24, baseY - 48);
    ctx.quadraticCurveTo(baseX, baseY - 80, baseX + 24, baseY - 48);
    ctx.lineTo(baseX + 24, baseY);
    ctx.closePath();
    ctx.fill();

    // ventanas doradas
    ctx.fillStyle = "rgba(219, 175, 65, 0.78)";
    ctx.fillRect(baseX - 6, baseY - 100, 12, 24);
    ctx.fillRect(baseX - 108, baseY - 58, 8, 16);
    ctx.fillRect(baseX + 100, baseY - 58, 8, 16);
    ctx.fillRect(baseX - 175, baseY - 45, 6, 12);
    ctx.fillRect(baseX + 169, baseY - 45, 6, 12);

    // banderas
    ctx.strokeStyle = "rgba(90, 70, 50, 1)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(baseX, baseY - 185);
    ctx.lineTo(baseX, baseY - 220);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(baseX - 101, baseY - 135);
    ctx.lineTo(baseX - 101, baseY - 165);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(baseX + 101, baseY - 135);
    ctx.lineTo(baseX + 101, baseY - 165);
    ctx.stroke();

    ctx.fillStyle = "rgba(130, 15, 20, 0.95)";

    ctx.beginPath();
    ctx.moveTo(baseX, baseY - 220);
    ctx.lineTo(baseX + 24, baseY - 212);
    ctx.lineTo(baseX, baseY - 204);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(baseX - 101, baseY - 165);
    ctx.lineTo(baseX - 78, baseY - 158);
    ctx.lineTo(baseX - 101, baseY - 151);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(baseX + 101, baseY - 165);
    ctx.lineTo(baseX + 124, baseY - 158);
    ctx.lineTo(baseX + 101, baseY - 151);
    ctx.closePath();
    ctx.fill();
}

function createAsteroids() {
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        activateMeteors();
    }

    drawSky();
    drawStars();
    drawMountains();
    drawCastle();
}

activateMeteors();
executeFrame();

window.addEventListener("resize", function () {
    activateMeteors();
});

function select(element) {
    element.style.animation = "selectoption 0.2s cubic-bezier(0.86, 0, 0.07, 1)";

    setTimeout(function () {
        element.style.animation = "";
        goScreen(element.textContent.trim());
    }, 200);
}

function goScreen(name) {
    switch (name) {
        case "NewGame":
            window.location.href = "./viewer/level1.html";
            break;

        case "Characters":
            window.location.href = "./viewer/viewerscharacters.html";
            break;

        case "Settings":
            window.location.href = "./viewer/viewersettings.html";
            break;

        case "Exit":
            alert("Gracias por jugar Imperio");
            break;

        default:
            console.log("Opción no reconocida:", name);
            break;
    }
}

// AUDIO play
window.addEventListener("load", function () {
    var audio = document.getElementById("miAudio");

    var reproducir = function () {
        audio.play().then(function () {
            document.removeEventListener("click", reproducir);
            document.removeEventListener("keydown", reproducir);
        }).catch(function () {
            console.log("Esperando interacción real...");
        });
    };

    document.addEventListener("click", reproducir);
    document.addEventListener("keydown", reproducir);
});