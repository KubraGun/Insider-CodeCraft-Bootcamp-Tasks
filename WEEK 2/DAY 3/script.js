// DOM Elements
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startBtn');
const resetButton = document.getElementById('resetBtn');
const progressBar = document.getElementById('progress');
const notification = document.getElementById('notification');

let countdown;
let secondsRemaining = 0;
let totalSeconds = 0;
let isRunning = false; // false in initial

// Func for showing notification
function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show'); /* in style.css, .notification.show */

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// formatting time
// numeric-only entries that the user does not specify as "m, s, h" will default to m.
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60; //math.floor for integer

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Updating countdown
function updateCountdown() {
    if (secondsRemaining <= 0){
        clearInterval(countdown);
        timerElement.textContent = "Time expired!";
        timerElement.classList.remove('ending');
        progressBar.style.width = '0%';
        isRunning = false;
        showNotification('⏰ Time Expired!');
        return
    }

    secondsRemaining--;
    timerElement.textContent = formatTime(secondsRemaining) //p tag

    // update progressbar
    const progressPercentage = (secondsRemaining / totalSeconds) * 100;
    progressBar.style.width = `${progressPercentage}%` /* we shoul percentage in style. */ 

    // animation for last 10s.
    // could have included a sound effect for the last 5 seconds
    if (secondsRemaining <= 10 && secondsRemaining > 0) {
        timerElement.classList.add('ending');
    } else {
        timerElement.classList.remove('ending');
    }
}

// start countdown
function startCountdown() {
    if (isRunning) {
        showNotification("⚠️ The countdown is already running!");
        return;
    }

    if (secondsRemaining <= 0){
        getTimeInput();
        return;
    }

    isRunning = true;
    showNotification("▶️ The countdown has begun!")
    countdown = setInterval(updateCountdown, 1000); // call updateCountdown method in every 1000 miliseconds
}

// reset countdown
function resetCountdown() {
    clearInterval(countdown);
    timerElement.textContent = "--:--:--";
    timerElement.classList.remove('ending');
    progressBar.style.width = '0%';

    secondsRemaining = 0;
    totalSeconds = 0;
    isRunning = false;
    showNotification("🔄 Countdown reset!");
    getTimeInput();
}

// get input
function getTimeInput() {
    let input;
    let isValid = false; // in initial

    while (!isValid) {
        input = prompt('Please enter the countdown time (e.g. 1h30m, 90m, 3600s:');

        if (input === null) return;

        // control null entry
        if (input.trim() === ''){
            alert('Invalid entries. Please try again.');
            continue;
        }

        // control formatting
        let seconds = 0;

        /* If there is an hour value (e.g., "2h" -> hourMatch[1] = "2"), 
            convert it to an integer (parseInt) and multiply by 3600. 
            This is because 1 hour = 3600 seconds. (1h = 60min * 60s = 3600s)
            Example: "2h" -> 2 * 3600 = 7200 seconds are added. */
        const hourMatch = input.match(/(\d+)h/);

        /* If there is a minute value (e.g., "45m" -> minuteMatch[1] = "45"), 
            convert it to an integer (parseInt) and multiply by 60.
            This is because 1 minute = 60 seconds. (1m = 60s)
            Example: "45m" -> 45 * 60 = 2700 seconds are added. */
        const minuteMatch = input.match(/(\d+)m/);

        /* If there is a second value (e.g., "30s" -> secondMatch[1] = "30"), 
        convert it to an integer (parseInt) and add it directly to the seconds.
        Example: "30s" -> 30 seconds are added. */
        const secondMatch = input.match(/(\d+)s/);


        /*
        2h → 2 * 3600 = 7200 s
        45m → 45 * 60 = 2700 s
        30s → 30 s
        Total: 7200 + 2700 + 30 = 9930 s

        */
        if (hourMatch) seconds += parseInt(hourMatch[1]) * 3600;
        if (minuteMatch) seconds += parseInt(minuteMatch[1]) * 60;
        if (secondMatch) seconds += parseInt(secondMatch[1]);
        
        // Sadece sayı girildiğinde dakika olarak algıla
        if (!hourMatch && !minuteMatch && !secondMatch) {
            const onlyNumber = parseInt(input);
            if (!isNaN(onlyNumber) && onlyNumber > 0) {
                seconds = onlyNumber * 60;
            }
        }
        
        if (seconds > 0) {
            secondsRemaining = seconds;
            totalSeconds = seconds;
            timerElement.textContent = formatTime(secondsRemaining);
            progressBar.style.width = '100%';
            isValid = true;
        } else {
            alert('Geçersiz giriş! Lütfen tekrar deneyin.');
        }
    }


}

// Event listener
startButton.addEventListener('click', startCountdown);
resetButton.addEventListener('click', resetCountdown);

// when page loading:
window.addEventListener('load', getTimeInput)

// NOT: son 10 saniyede her saniye değişiminde sclae özelliği değiştirilebilir