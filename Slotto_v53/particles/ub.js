function initParticles() {
    c = document.getElementById('canvas');
    ctx = c.getContext('2d');
    btn = document.getElementsByClassName('btn')[0];

    c.width = 4000;
    c.height = 550;

    mouseX = c.width / 2;
    mouseY = c.width / 2;
    txtPosition = 0;

    particles = [];

    btn.addEventListener('mouseup', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY / 3;
        createParticles();
    });
}

function draw() {
    window.requestAnimationFrame(draw);

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
        console.log("drawing!");
        then = now - (delta % interval);
        drawBg();
        incParticles();
        drawParticles();
    }
}

function drawBg() {
    ctx.rect(0, 0, c.width, c.height);
    ctx.fillStyle = "rgb(34, 34, 34)";
    ctx.fill();
}

function drawParticles() {
    for (i = 0; i < particles.length; i++) {
        ctx.beginPath();
        ctx.arc(particles[i].x,
            particles[i].y,
            particles[i].size,
            0,
            Math.PI * 2);
        ctx.fillStyle = particles[i].color;
        ctx.closePath();
        ctx.fill();
    }
}

function incParticles() {
    for (i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].velX;
        particles[i].y += particles[i].velY;

        particles[i].size = Math.max(0, (particles[i].size - 0.125));

        if (particles[i].size <= 0) {
            particles.splice(i, 1);
        }
    }
}

function createParticles() {
    for (i = 0; i < 40; i++) {
        particles.push({
            x: mouseX,
            y: mouseY,
            size: parseInt(Math.random() * 10),
            color: 'rgb(' + ranRgb() + ')',
            velX: ranVel() * 9,
            velY: ranVel() * 9
        });
    }
}

function ranRgb() {
    var colors = [
        '255, 122, 206',
        '0, 157, 255',
        '0, 240, 168',
        '0, 240, 120'
    ];

    var i = parseInt(Math.random() * 10);

    return colors[i];
}

function ranVel() {
    var vel = 0;

    if (Math.random() < 0.5) {
        vel = Math.abs(Math.random());
    } else {
        vel = -Math.abs(Math.random());
    }

    return vel;
}

var c = null;
var ctx = null;
var btn = null;

var mouseX = null;
var mouseY = null;
var txtPosition = null;
var particles = null;

var fps = 40;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

initParticles();
draw();