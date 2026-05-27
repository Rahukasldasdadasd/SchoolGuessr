// =========================
// ROUND DATA
// =========================

const rounds = [

    {
        title: "Computer Science Lab",
        image: "testimgclassroom.jpg",
        actualX: 3745,
        actualY: 2677
    },

    {
        title: "Library",
        image: "library.jpeg",
        actualX: 1783,
        actualY: 2750
    },

    {
        title: "Art Display Area",
        image: "art_display.jpeg",
        actualX: 1716,
        actualY: 2021
    },

    {
        title: "Random Classroom",
        image: "PKclass.jpeg",
        actualX: 1481,
        actualY: 2153
    },

    {
        title: "Stairs",
        image: "stairs.jpeg",
        actualX: 2637,
        actualY: 2648
    }

];

// =========================
// GAME STATE
// =========================

let currentRound = 0;
let totalScore = 0;

let guessX = 0;
let guessY = 0;

let hasGuessed = false;

// =========================
// ELEMENTS
// =========================

const map = document.getElementById('schoolMap');
const marker = document.getElementById('marker');
const submitBtn = document.getElementById('submitGuess');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const restartBtn = document.getElementById('restartBtn');

const result = document.getElementById('result');
const coordsDisplay = document.getElementById('coordinates');
const svgLineOverlay = document.getElementById('lineOverlay');
const flag = document.getElementById('flag');

const roomImage = document.getElementById('roomImage');
const roundTitle = document.getElementById('roundTitle');
const roundCounter = document.getElementById('roundCounter');

// =========================
// SETTINGS
// =========================

const PIXELS_PER_FOOT = 5.2;

// =========================
// LOAD ROUND
// =========================

function loadRound() {

    const round = rounds[currentRound];

    roomImage.src = round.image;

    roundTitle.textContent =
        round.title;

    roundCounter.textContent =
        `Round ${currentRound + 1} / ${rounds.length}`;

    // Reset UI
    marker.style.display = 'none';

    flag.style.display = 'none';

    svgLineOverlay.innerHTML = '';

    result.innerHTML = '';

    hasGuessed = false;

    submitBtn.disabled = false;

    nextRoundBtn.style.display = 'none';

    restartBtn.style.display = 'none';
}

// =========================
// HELPER FUNCTIONS
// =========================

function getMapRect() {

    return document
        .getElementById('mapContainer')
        .getBoundingClientRect();
}

function getPixelPosition(x, y) {

    const rect = getMapRect();

    const img =
        document.getElementById('schoolMap');

    const scaleX =
        img.naturalWidth / rect.width;

    const scaleY =
        img.naturalHeight / rect.height;

    return {
        x: x / scaleX,
        y: y / scaleY
    };
}

// =========================
// HOVER COORDINATES
// =========================

map.addEventListener('mousemove', function (event) {

    const rect = map.getBoundingClientRect();

    const scaleX =
        map.naturalWidth / rect.width;

    const scaleY =
        map.naturalHeight / rect.height;

    const x =
        (event.clientX - rect.left) * scaleX;

    const y =
        (event.clientY - rect.top) * scaleY;

    coordsDisplay.textContent =
        `X: ${Math.round(x)}  Y: ${Math.round(y)}`;
});

map.addEventListener('mouseleave', function () {

    coordsDisplay.textContent =
        'X: --  Y: --';
});

// =========================
// PLACE MARKER
// =========================

map.addEventListener('click', function (event) {

    if (hasGuessed) return;

    const rect = map.getBoundingClientRect();

    const scaleX =
        map.naturalWidth / rect.width;

    const scaleY =
        map.naturalHeight / rect.height;

    // REAL IMAGE COORDS
    guessX =
        (event.clientX - rect.left) * scaleX;

    guessY =
        (event.clientY - rect.top) * scaleY;

    // DISPLAY POSITION
    const displayX =
        event.clientX - rect.left;

    const displayY =
        event.clientY - rect.top;

    marker.style.left =
        displayX + 'px';

    marker.style.top =
        displayY + 'px';

    marker.style.display = 'block';
});

// =========================
// DISTANCE
// =========================

function calculateDistance(x1, y1, x2, y2) {

    const pixelDistance = Math.sqrt(
        Math.pow(x2 - x1, 2) +
        Math.pow(y2 - y1, 2)
    );

    return pixelDistance / PIXELS_PER_FOOT;
}

// =========================
// SCORE
// =========================

function calculateScore(distance) {

    return Math.max(
        0,
        Math.floor(2000 - distance * 4)
    );
}

// =========================
// SCORE MESSAGE
// =========================

function getScoreMessage(score) {

    if (score >= 1950)
        return "🏆 PERFECT!";

    if (score >= 1750)
        return "🔥 Excellent!";

    if (score >= 1500)
        return "👍 Good guess!";

    if (score >= 1000)
        return "🤔 Not bad!";

    if (score >= 500)
        return "😅 Way off!";

    return "❌ Missed!";
}

// =========================
// DRAW LINE
// =========================

function drawLineAnimated(x1, y1, x2, y2) {

    svgLineOverlay.innerHTML = '';

    const svgns =
        "http://www.w3.org/2000/svg";

    const line =
        document.createElementNS(svgns, 'line');

    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);

    line.setAttribute('x2', x1);
    line.setAttribute('y2', y1);

    line.setAttribute(
        'stroke',
        'rgba(255, 71, 87, 0.8)'
    );

    line.setAttribute('stroke-width', '3');

    line.setAttribute(
        'stroke-dasharray',
        '10,10'
    );

    line.setAttribute(
        'stroke-linecap',
        'round'
    );

    svgLineOverlay.appendChild(line);

    let startTime = null;

    function animateLine(timestamp) {

        if (!startTime)
            startTime = timestamp;

        const progress = Math.min(
            (timestamp - startTime) / 1000,
            1
        );

        line.setAttribute(
            'x2',
            x1 + (x2 - x1) * progress
        );

        line.setAttribute(
            'y2',
            y1 + (y2 - y1) * progress
        );

        if (progress < 1) {

            requestAnimationFrame(
                animateLine
            );
        }
    }

    requestAnimationFrame(animateLine);
}

// =========================
// SUBMIT GUESS
// =========================

submitBtn.addEventListener('click', function () {

    if (marker.style.display !== 'block') {

        result.textContent =
            'Click on the map to place your guess first!';

        return;
    }

    const round =
        rounds[currentRound];

    const distance =
        calculateDistance(
            guessX,
            guessY,
            round.actualX,
            round.actualY
        );

    const score =
        calculateScore(distance);

    totalScore += score;

    const message =
        getScoreMessage(score);

    result.innerHTML = `
        ${message}<br>
        Distance: ${distance.toFixed(1)} feet<br>
        Score: ${score}/2000<br>
        Total Score: ${totalScore}
    `;

    // Show actual location flag
    const actualPos =
        getPixelPosition(
            round.actualX,
            round.actualY
        );

    flag.style.left =
        actualPos.x + 'px';

    flag.style.top =
        actualPos.y + 'px';

    flag.style.display = 'block';

    // Draw line
    const guessPos =
        getPixelPosition(
            guessX,
            guessY
        );

    drawLineAnimated(
        guessPos.x,
        guessPos.y,
        actualPos.x,
        actualPos.y
    );

    hasGuessed = true;

    submitBtn.disabled = true;

    // FINAL ROUND
    if (currentRound === rounds.length - 1) {

        result.innerHTML += `
            <br><br>
            🎉 GAME COMPLETE!<br>
            Final Score:
            ${totalScore}
            / ${rounds.length * 2000}
        `;

        restartBtn.style.display =
            'inline-block';

    } else {

        nextRoundBtn.style.display =
            'inline-block';
    }
});

// =========================
// NEXT ROUND
// =========================

nextRoundBtn.addEventListener(
    'click',
    function () {

        currentRound++;

        loadRound();
    }
);

// =========================
// RESTART
// =========================

restartBtn.addEventListener(
    'click',
    function () {

        currentRound = 0;

        totalScore = 0;

        loadRound();
    }
);

// =========================
// ERROR HANDLING
// =========================

roomImage.addEventListener(
    'error',
    function () {

        this.alt =
            'Classroom image missing';

        this.style.backgroundColor =
            '#f0f0f0';

        this.style.minHeight =
            '300px';
    }
);

map.addEventListener(
    'error',
    function () {

        this.alt =
            'School map missing';

        this.style.backgroundColor =
            '#f0f0f0';

        this.style.minHeight =
            '300px';
    }
);

// =========================
// START GAME
// =========================

loadRound();

console.log('SchoolGuessr loaded!');