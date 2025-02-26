// DOM Elements
const limitInput = document.getElementById('limit');
const calculateBtn = document.getElementById('calculate-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const resultContainer = document.getElementById('result-container');
const resultText = document.getElementById('result-text');
const errorMessage = document.getElementById('error-message');
const historyBody = document.getElementById('history-body');

// Chart instance
let sequenceChart = null;

// Cache for Collatz sequences
let collatzCache = {};

// Load cache from localStorage if available
if (localStorage.getItem('collatzCache')) {
    try {
        collatzCache = JSON.parse(localStorage.getItem('collatzCache'));
    } catch (e) {
        console.error('Error loading cache from localStorage:', e);
        collatzCache = {};
    }
}

// Load history from localStorage if available
let calculationHistory = [];
if (localStorage.getItem('collatzHistory')) {
    try {
        calculationHistory = JSON.parse(localStorage.getItem('collatzHistory'));
        updateHistoryTable();
    } catch (e) {
        console.error('Error loading history from localStorage:', e);
        calculationHistory = [];
    }
}

// Function to calculate Collatz sequence length with caching
function calculateSequenceLength(n) {
    // Original number for caching purposes
    const original = n;

    // If we already calculated this number, return from cache
    if (collatzCache[original]) {
        return collatzCache[original];
    }

    let length = 1;

    // Calculate sequence until we reach 1
    while (n !== 1) {
        // If we encounter a number we've already calculated, use that result
        if (collatzCache[n]) {
            length += collatzCache[n] - 1;
            break;
        }

        // Apply Collatz rule
        if (n % 2 === 0) {
            n = n / 2;
        } else {
            n = n * 3 + 1;
        }

        length++;
    }

    // Store in cache
    collatzCache[original] = length;

    return length;
}

// Function to generate entire sequence for visualization
function generateSequence(n) {
    const sequence = [n];

    while (n !== 1) {
        if (n % 2 === 0) {
            n = n / 2;
        } else {
            n = n * 3 + 1;
        }
        sequence.push(n);
    }

    return sequence;
}

// Function to find the longest Collatz sequence
function findLongestCollatzSequence() {
    const limit = parseInt(limitInput.value, 10);

    // Validate input
    if (isNaN(limit) || limit < 1 || limit > 1000000) {
        errorMessage.style.display = 'block';
        return;
    }

    errorMessage.style.display = 'none';

    // Disable calculate button during calculation
    calculateBtn.disabled = true;
    calculateBtn.textContent = 'Calculating...';

    let maxLength = 0;
    let numberWithMaxLength = 0;
    let sequenceToVisualize = [];

    // Process numbers in chunks to provide progress updates
    const chunkSize = 1000;
    const totalChunks = Math.ceil(limit / chunkSize);

    for (let chunk = 0; chunk < totalChunks; chunk++) {
        const start = chunk * chunkSize + 1;
        const end = Math.min((chunk + 1) * chunkSize, limit);

        // Find longest sequence in this chunk
        for (let i = start; i <= end; i++) {
            const length = calculateSequenceLength(i);

            if (length > maxLength) {
                maxLength = length;
                numberWithMaxLength = i;
            }
        }

        // Generate sequence for visualization
        sequenceToVisualize = generateSequence(numberWithMaxLength);

        // Update intermediate result
        resultText.innerHTML = `Current longest chain: <strong>${numberWithMaxLength.toLocaleString()}</strong> with <strong>${maxLength}</strong> steps`;
        resultContainer.style.display = 'block';
    }

    // Update result text
    resultText.innerHTML = `The number <strong>${numberWithMaxLength.toLocaleString()}</strong> has the longest Collatz sequence with <strong>${maxLength}</strong> steps`;

    // Update cache
    localStorage.setItem('collatzCache', JSON.stringify(collatzCache));

    // Add to history
    addToHistory(limitInput.value, numberWithMaxLength, maxLength);

    // Update the chart
    updateChart(sequenceToVisualize);

    // Enable the calculate button
    calculateBtn.disabled = false;
    calculateBtn.textContent = 'Calculate Longest Sequence';
}

// Function to update the chart with sequence data
function updateChart(sequence) {
    // Destroy previous chart if it exists
    if (sequenceChart) {
        sequenceChart.destroy();
    }

    // Create datasets for the chart
    const labels = Array.from({ length: sequence.length }, (_, i) => i + 1);

    // Create the chart
    const ctx = document.getElementById('sequence-chart').getContext('2d');
    sequenceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Collatz Sequence',
                data: sequence,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                pointRadius: sequence.length > 100 ? 0 : 2,
                pointHoverRadius: 5,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Value'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Step'
                    },
                    ticks: {
                        maxTicksLimit: 20
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            },
            animation: {
                duration: 1000
            }
        }
    });
}

// Function to add a calculation to history
function addToHistory(limit, number, length) {
    const now = new Date();
    const formattedDate = now.toLocaleString();

    const historyEntry = {
        limit: parseInt(limit, 10),
        number: number,
        length: length,
        date: formattedDate
    };

    // Add to history array
    calculationHistory.unshift(historyEntry);

    // Keep only the most recent 10 entries
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }

    // Save to localStorage
    localStorage.setItem('collatzHistory', JSON.stringify(calculationHistory));

    // Update the history table
    updateHistoryTable();
}

// Function to update the history table
function updateHistoryTable() {
    historyBody.innerHTML = '';

    if (calculationHistory.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center;">No calculations yet</td>';
        historyBody.appendChild(row);
        return;
    }

    calculationHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.limit.toLocaleString()}</td>
            <td>${entry.number.toLocaleString()}</td>
            <td>${entry.length}</td>
            <td>${entry.date}</td>
        `;

        // Add click event to reuse this calculation
        row.style.cursor = 'pointer';
        row.title = 'Click to view this result again';
        row.addEventListener('click', () => {
            limitInput.value = entry.limit;
            resultText.innerHTML = `The number <strong>${entry.number.toLocaleString()}</strong> has the longest Collatz sequence with <strong>${entry.length}</strong> steps`;
            resultContainer.style.display = 'block';

            // Generate the sequence for this number to display in chart
            const sequence = generateSequence(entry.number);
            updateChart(sequence);
        });

        historyBody.appendChild(row);
    });
}

// Event Listeners
calculateBtn.addEventListener('click', findLongestCollatzSequence);

clearCacheBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the calculation cache? This will slow down future calculations.')) {
        collatzCache = {};
        localStorage.removeItem('collatzCache');
        alert('Cache cleared successfully.');
    }
});

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear your calculation history?')) {
        calculationHistory = [];
        localStorage.removeItem('collatzHistory');
        updateHistoryTable();
        alert('History cleared successfully.');
    }
});

// Input validation
limitInput.addEventListener('input', () => {
    const value = parseInt(limitInput.value, 10);
    if (isNaN(value) || value < 1 || value > 1000000) {
        errorMessage.style.display = 'block';
        calculateBtn.disabled = true;
    } else {
        errorMessage.style.display = 'none';
        calculateBtn.disabled = false;
    }
});

// Initialize the history table
updateHistoryTable();
