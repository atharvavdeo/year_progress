const quotes = [
    "How much of your life did you really change?",
    "What happened to those commitments?",
    "Is this the year you wanted?",
    "Be honest with yourself.",
    "Time doesn't wait for perfect moments.",
    "Your excuses expire with the calendar.",
    "What story will you tell next year?",
    "The clock is still ticking.",
    "Your future self is watching.",
    "This moment is all you have left.",
    "Stop planning. Start doing.",
    "Every day you wait is a day lost forever."
];

function calculateYearPercentageLeft() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);
    const totalYearMs = endOfYear - startOfYear;
    const elapsedMs = now - startOfYear;
    const remainingMs = totalYearMs - elapsedMs;
    const percentageLeft = (remainingMs / totalYearMs) * 100;
    return Math.max(0, Math.round(percentageLeft * 10) / 10);
}

function typeText(element, text, speed = 50) {
    return new Promise((resolve) => {
        let i = 0;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        element.appendChild(cursor);
        function typeChar() {
            if (i < text.length) {
                element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
                i++;
                setTimeout(typeChar, speed);
            } else {
                setTimeout(() => {
                    cursor.remove();
                    resolve();
                }, 500);
            }
        }
        typeChar();
    });
}

async function fetchRandomQuote() {
    const quoteAPIs = [
        {
            name: 'Quotable.io',
            url: 'https://api.quotable.io/random?tags=motivational,inspirational&minLength=20&maxLength=100',
            parser: (data) => data.content
        },
        {
            name: 'ZenQuotes',
            url: 'https://zenquotes.io/api/random',
            parser: (data) => Array.isArray(data) ? data[0].q : data.q
        },
        {
            name: 'Quotable Categories',
            url: 'https://api.quotable.io/random?tags=success,wisdom,life&minLength=15&maxLength=120',
            parser: (data) => data.content
        },
        {
            name: 'QuoteGarden',
            url: 'https://quote-garden.herokuapp.com/api/v3/quotes/random',
            parser: (data) => data.data.quoteText.replace(/"/g, '')
        }
    ];

    for (const api of quoteAPIs) {
        try {
            console.log(`Trying ${api.name}...`);
            const response = await fetch(api.url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(5000)
            });
            if (!response.ok) {
                throw new Error(`${api.name} API returned ${response.status}`);
            }
            const data = await response.json();
            const quote = api.parser(data);
            if (quote && quote.length > 10 && quote.length < 200) {
                console.log(`✓ Successfully fetched quote from ${api.name}`);
                return quote;
            } else {
                throw new Error(`Invalid quote format from ${api.name}`);
            }
        } catch (error) {
            console.log(`✗ ${api.name} failed:`, error.message);
            continue;
        }
    }

    console.log('All APIs failed, using local quotes');
    return getLocalRandomQuote();
}

function getLocalRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function showElement(element) {
    element.classList.add('visible');
}

function fadeToStartNow() {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.classList.add('fade-out');
    setTimeout(() => {
        mainContainer.innerHTML = '<div class="start-now">Start Now.</div>';
        mainContainer.classList.remove('fade-out');
    }, 1000);
}

function handleGoalSubmission(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
        fadeToStartNow();
    }
}

async function initApp() {
    const percentageText = document.getElementById('percentageText');
    const quoteSection = document.getElementById('quoteSection');
    const quoteText = document.getElementById('quoteText');
    const inputSection = document.getElementById('inputSection');
    const goalInput = document.getElementById('goalInput');
    const percentageLeft = calculateYearPercentageLeft();
    const message = `Only ${percentageLeft}% of the year is left...`;
    try {
        await typeText(percentageText, message, 60);
        setTimeout(async () => {
            try {
                const quote = await fetchRandomQuote();
                quoteText.textContent = quote;
                showElement(quoteSection);
                setTimeout(() => {
                    showElement(inputSection);
                    goalInput.focus();
                }, 800);
            } catch (error) {
                console.error('Error loading quote:', error);
                quoteText.textContent = getLocalRandomQuote();
                showElement(quoteSection);
            }
        }, 1000);
    } catch (error) {
        console.error('Error in typing animation:', error);
    }
    goalInput.addEventListener('keypress', handleGoalSubmission);
}

function startApp() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
}

startApp();