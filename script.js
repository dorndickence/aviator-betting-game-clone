// Updated script.js for Kenyan version of Aviator Game with M-Pesa Integration, Admin Panel, and Login System

// User and Admin Data
let users = {}; // Store users' phone numbers and balances
let isAdmin = false; // Flag to check admin login

// Prompt Login
function login() {
    const loginType = prompt("Enter '1' for User Login or '2' for Admin Login:");

    if (loginType === '1') {
        const phoneNumber = prompt("Enter your M-Pesa number:");
        if (!users[phoneNumber]) {
            users[phoneNumber] = { balance: 3000 }; // Initialize new user with balance
            alert("New account created! Welcome.");
        } else {
            alert("Welcome back!");
        }
        userPhoneNumber = phoneNumber;
    } else if (loginType === '2') {
        const adminPassword = prompt("Enter Admin Password:");
        if (adminPassword === 'admin123') { // Replace with a secure password mechanism
            isAdmin = true;
            alert("Admin access granted.");
        } else {
            alert("Incorrect password! Access denied.");
            login();
        }
    } else {
        alert("Invalid option. Try again.");
        login();
    }
}

login();

// Create Canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Define the speed and direction of the dot
let speedX = 3;
let speedY = 1;

// Set the size of the canvas
canvas.width = 800;
canvas.height = 250;

// Set the starting position of the dot
let x = 0;
let y = canvas.height;

// Start the animation
let animationId = requestAnimationFrame(draw);

let dotPath = [];
let counter = 1.0;
let multiplier = 0;
let counterDepo = [1.01, 18.45, 2.02, 5.21, 1.22, 1.25, 2.03, 4.55, 65.11, 1.03, 1.10, 3.01, 8.85, 6.95, 11.01, 2.07, 4.05, 1.51, 1.02, 1.95, 1.05, 3.99, 2.89, 4.09, 11.20, 2.55];
let randomStop = Math.random() * (10 - 0.1) + 0.8;
let cashedOut = false; // flag to indicate if the user has cashed out
let placedBet = false;
let isFlying = true;

// Admin Panel Data
let totalGains = 0;
let totalAccountBalance = Object.values(users).reduce((sum, user) => sum + user.balance, 0);

let balanceAmount = document.getElementById('balance-amount');
let calculatedBalanceAmount = users[userPhoneNumber]?.balance || 3000; // Starting balance in KES
balanceAmount.textContent = calculatedBalanceAmount.toString() + ' KES';
let betButton = document.getElementById('bet-button');
betButton.textContent = 'Bet';

// Previous Counters
let lastCounters = document.getElementById('last-counters');
let counterItem = lastCounters.getElementsByTagName('p');
let classNameForCounter = '';

function updateCounterDepo() {
    lastCounters.innerHTML = counterDepo.map(function (i) {
            if ((i < 2.00)) {
                classNameForCounter = 'blueBorder';
            } else if ((i >= 2) && (i < 10)) {
                classNameForCounter = 'purpleBorder';
            } else classNameForCounter = 'burgundyBorder';

            return '<p' + ' class=' + classNameForCounter + '>' + i + '</p>';
        }
    ).join('');
}

// Hide letter E from input
let inputBox = document.getElementById("bet-input");
let invalidChars = ["-", "+", "e"];
inputBox.addEventListener("keydown", function (e) {
    if (invalidChars.includes(e.key)) {
        e.preventDefault();
    }
});

let messageField = document.getElementById('message');
messageField.textContent = 'Wait for the next round';

// Animation
function draw() {
    // Counter
    counter += 0.001;
    document.getElementById('counter').textContent = counter.toFixed(2) + 'x';

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Call the function to update the counter item initially
    updateCounterDepo();

    x += speedX;
    // Calculate the new position of the dot
    if (counter < randomStop) {
        y -= speedY;
        y = canvas.height / 2 + 50 * Math.cos(x / 100);
        isFlying = true;
    } else {
        x = 0;
        y = 0;
        isFlying = false;
    }

    // Check if it's time to stop the animation
    if (counter >= randomStop) {

        messageField.textContent = 'Place your bet';

        // Stop the animation
        cancelAnimationFrame(animationId);

        counterDepo.unshift(counter.toFixed(2));

        // Wait for 8 seconds and then start a new animation
        setTimeout(() => {

            // Generate a new randomStop value and reset the counter to 1
            randomStop = Math.random() * (10 - 0.1) + 0.8;
            counter = 1.0;
            x = canvas.width / 2;
            y = canvas.height / 2;
            dotPath = [];
            cashedOut = false;
            isFlying = true;
            messageField.textContent = '';

            if (!placedBet && cashedOut) {
                betButton.textContent = 'Bet';
            }

            // Start the animation again
            animationId = requestAnimationFrame(draw);

        }, 8000);

        return;
    }

    // Push the dot's current coordinates into the dotPath array
    dotPath.push({ x: x, y: y });

    // Calculate the translation value for the canvas
    const canvasOffsetX = canvas.width / 2 - x;
    const canvasOffsetY = canvas.height / 2 - y;

    // Save the current transformation matrix
    ctx.save();

    // Translate the canvas based on the dot's position
    ctx.translate(canvasOffsetX, canvasOffsetY);

    // Draw the dot's path
    for (let i = 1; i < dotPath.length; i++) {
        ctx.beginPath();
        ctx.strokeStyle = '#dc3545';
        ctx.moveTo(dotPath[i - 1].x, dotPath[i - 1].y);
        ctx.lineTo(dotPath[i].x, dotPath[i].y);
        ctx.stroke();
    }

    // Draw the dot
    ctx.beginPath();
    ctx.fillStyle = '#dc3545';
    ctx.lineWidth = 5;
    ctx.arc(x, y, 1, 0, 2 * Math.PI);
    ctx.fill();

    // Draw the image on top of the dot
    ctx.drawImage(image, x - 28, y - 78, 185, 85);

    // Restore the transformation matrix to its original state
    ctx.restore();

    // Request the next frame of the animation
    animationId = requestAnimationFrame(draw);
}

// Start the animation
draw();

betButton.addEventListener('click', () => {
    if (placedBet) {
        cashOut();
    } else {
        placeBet();
    }
    if (!placedBet && !isFlying) {
        messageField.textContent = 'Place your bet';
    }
});

// Function to place a bet
function placeBet() {
    if (placedBet || inputBox.value === 0 || isNaN(inputBox.value) || isFlying || inputBox.value > calculatedBalanceAmount) {
        messageField.textContent = 'Wait for the next round';
        return;
    }

    if ((counter >= randomStop) && !isFlying && (inputBox.value <= calculatedBalanceAmount)) {
        if (inputBox.value && (inputBox.value <= calculatedBalanceAmount)) {
            calculatedBalanceAmount -= inputBox.value;
            users[userPhoneNumber].balance = calculatedBalanceAmount;
            totalAccountBalance -= inputBox.value;
            totalGains += inputBox.value;
            balanceAmount.textContent = calculatedBalanceAmount.toFixed(2).toString() + ' KES';
            betButton.textContent = 'Cash Out';
            placedBet = true;
            messageField.textContent = 'Placed Bet';
        } else {
            messageField.textContent = 'Insufficient balance to place bet';
        }
    } else {
        if (isFlying) {
            messageField.textContent = 'Wait for the next round';
        }
    }
}

// Function to cash out bet
function cashOut() {
    if (cashedOut || (inputBox.value === 0)) {
        messageField.textContent = 'Wait for the next round';
        return;
    }

    if ((counter < randomStop)) {
        const winnings = inputBox.value * counter; // Calculate winnings based on counter
        calculatedBalanceAmount += winnings; // Add winnings to balance
        users[userPhoneNumber].balance = calculatedBalanceAmount;
        totalAccountBalance += winnings; // Update total account balance
        balanceAmount.textContent = calculatedBalanceAmount.toFixed(2).toString() + ' KES';

        cashedOut = true; // set flag to indicate user has cashed out
        placedBet = false;
        betButton.textContent = 'Bet';
        messageField.textContent = `Bet cashed out: ${winnings.toFixed(2)} KES`;
    } else {
        messageField.textContent = "Can't cash out now";
    }
}

// Function to withdraw balance
function withdrawFunds() {
    if (calculatedBalanceAmount >= 100) {
        alert(`Withdrawing ${calculatedBalanceAmount} KES to M-Pesa number ${userPhoneNumber}`);
        users[userPhoneNumber].balance = 0;
        totalAccountBalance -= calculatedBalanceAmount;
        calculatedBalanceAmount = 0;
        balanceAmount.textContent = calculatedBalanceAmount.toFixed(2) + ' KES';
    } else {
        alert("You need at least 100 KES to withdraw.");
    }
}

// Admin panel logging (example usage for real-time monitoring)
function logAdminData() {
    if (isAdmin) {
        console.clear();
        console.log(`Total Gains: ${totalGains} KES`);
        console.log(`Total Account Balance: ${totalAccountBalance} KES`);
        console.table(users);
    }
}

setInterval(logAdminData, 10000); // Log data every 10 seconds
