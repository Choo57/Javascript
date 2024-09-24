const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
canvas.width = 400;
canvas.height = 400;

const circle = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 200
};

function getUniqueColors() {
    const shuffledColors = COLORS.sort(() => 0.5 - Math.random()); // Shuffle the COLORS array
    return shuffledColors.slice(0, NO_OF_BALLS); // Select the first set of unique colors
}

// Configurable constants
const NO_OF_BALLS = 5;                      // Number of balls. Make sure the BALL_COLORS array is also configured accordingly
const GRAVITY = 0.35;                       // Gravity constant
//const FRICTION = 0.99;                    // Friction to reduce speed after bouncing
const SPEED_GAIN_FACTOR = 1000;             // Speed gain multiplier when hitting the wall
const DIAMETER_INCREASE_FACTOR = 1.04;      // Diameter increase factor when colliding with another ball
const MAX_SPEED = 10;                       // Maximum speed (both vx and vy)
const COLORS = ['#f44336', '#e81e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#9e9e9e', '#607d8b'];
const BALL_COLOURS = getUniqueColors();     // Pick unuqie colors for the balls from the above COLORS array. Can also use the word 'random' to get a random color assigned

let continueAnimation = true;
let collisionCounter = 0;

// Ball constructor
class Ball {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.vx = (Math.random() - 0.5) * 4; // Random horizontal velocity
        this.vy = 0; // Start with zero vertical velocity (falling due to gravity)
        this.color = color === 'random' ? `hsl(${Math.random() * 360}, 100%, 50%)` : color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(balls) {
        this.vy += GRAVITY; // Apply gravity to vertical velocity

        this.vx = Math.max(Math.min(this.vx, MAX_SPEED), -MAX_SPEED); // Ensure the ball does not exceed the maximum speed
        this.vy = Math.max(Math.min(this.vy, MAX_SPEED), -MAX_SPEED); // Ensure the ball does not exceed the maximum speed

        this.x += this.vx; // Move the ball
        this.y += this.vy; // Move the ball

        const distFromCenter = Math.sqrt((this.x - circle.x) ** 2 + (this.y - circle.y) ** 2); // Check collision with the circle's boundary
        
        if (distFromCenter + this.radius >= circle.radius) {
            collisionCounter++;
            console.log('collision?', collisionCounter)
            const angle = Math.atan2(this.y - circle.y, this.x - circle.x);

            this.vx = -Math.cos(angle) * Math.abs(this.vx) * SPEED_GAIN_FACTOR; // Reflect velocity based on angle of impact with the circle boundary. Gain speed upon bouncing
            this.vy = -Math.sin(angle) * Math.abs(this.vy) * SPEED_GAIN_FACTOR; // Reflect velocity based on angle of impact with the circle boundary. Gain speed upon bouncing

            this.vx = Math.max(Math.min(this.vx, MAX_SPEED), -MAX_SPEED); // Ensure the speed is still capped after bouncing
            this.vy = Math.max(Math.min(this.vy, MAX_SPEED), -MAX_SPEED); // Ensure the speed is still capped after bouncing

            const overlap = (distFromCenter + this.radius) - circle.radius; // Move the ball slightly inside the circle to prevent it from sticking to the boundary
            this.x -= Math.cos(angle) * overlap;
            this.y -= Math.sin(angle) * overlap;
        }

        // Check collision with other balls and handle size increase
        for (let i = 0; i < balls.length; i++) {
            if (balls[i] !== this) {
                const dx = balls[i].x - this.x;
                const dy = balls[i].y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.radius + balls[i].radius) {
                    
                    const angle = Math.atan2(dy, dx); // Simple elastic collision
                    const v1 = Math.sqrt(this.vx ** 2 + this.vy ** 2);
                    const v2 = Math.sqrt(balls[i].vx ** 2 + balls[i].vy ** 2);

                    this.vx = -Math.cos(angle) * v2;
                    this.vy = -Math.sin(angle) * v2;
                    balls[i].vx = Math.cos(angle) * v1;
                    balls[i].vy = Math.sin(angle) * v1;

                    const overlap = this.radius + balls[i].radius - distance; // Prevent overlap by adjusting the position
                    const adjustmentFactor = overlap / 2;
                    this.x -= Math.cos(angle) * adjustmentFactor;
                    this.y -= Math.sin(angle) * adjustmentFactor;
                    balls[i].x += Math.cos(angle) * adjustmentFactor;
                    balls[i].y += Math.sin(angle) * adjustmentFactor;

                    const futureRadiusThis = this.radius * DIAMETER_INCREASE_FACTOR; // Check if there is enough room to grow
                    const futureRadiusOther = balls[i].radius * DIAMETER_INCREASE_FACTOR;

                    const futureDistFromCenterThis = Math.sqrt((this.x - circle.x) ** 2 + (this.y - circle.y) ** 2) + futureRadiusThis;
                    const futureDistFromCenterOther = Math.sqrt((balls[i].x - circle.x) ** 2 + (balls[i].y - circle.y) ** 2) + futureRadiusOther;

                    if (futureDistFromCenterThis < circle.radius) { // Check if growing would keep 'this' ball inside the circle
                        this.radius *= DIAMETER_INCREASE_FACTOR;
                        console.log(this.color)
                        collisionCounter = 0;
                    }

                    if (futureDistFromCenterOther < circle.radius) { // Check if growing would keep the 'other' balls inside the circle
                        console.log(balls[i]['color'])
                        balls[i].radius *= DIAMETER_INCREASE_FACTOR;
                        collisionCounter = 0;
                    }
                }
            }
        }

        if(collisionCounter > 200) {
            continueAnimation = false;
        }

        this.draw();
    }
}

// DRAW THE BALLS
let balls = [];
for (let i = 0; i < NO_OF_BALLS; i++) {
    // Start the balls in random positions inside the circle but above the bottom half
    const angle = Math.random() * Math.PI; // Random angle in the upper half
    const r = Math.random() * (circle.radius - 10); // Ensure they start inside the circle
    const x = circle.x + r * Math.cos(angle);
    const y = circle.y + r * Math.sin(angle);
    const color = BALL_COLOURS[i % BALL_COLOURS.length]; // Assign color from the array
    balls.push(new Ball(x, y, color));
}

// DRAW THE CIRCLE
function drawCircle() {
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9f3'; // Inside of the circle is white
    ctx.fill();
    ctx.strokeStyle = '#fef9f3';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

// ANIMATION LOOP
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111'; // Very dark gray background
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas
    
    
    drawCircle();
    balls.forEach(ball => ball.update(balls)); // execute balls.update() for each ball against all the balls for every animation frame

    if(continueAnimation) {
        requestAnimationFrame(animate); // repeat animation as per screens refresh rate frequency (e.g. @60 hz)
    }
}

animate();
