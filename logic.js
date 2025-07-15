
// Kabo Auto Invest v1.1 - Offline simulation with anytime withdrawal

// Initial constants
const initialInvestment = 150;
const dailyProfitRate = 0.05; // 5%
const dailyBonusAmount = 35;
const investmentDuration = 365; // days
const levelThresholds = [500, 1500, 5000]; // Profit levels for upgrades

// Initialize or load data from localStorage
let data = JSON.parse(localStorage.getItem('kaboInvestData')) || {
    day: 0,
    investment: initialInvestment,
    profit: 0,
    bonus: 0,
    level: 1,
    totalEarned: 0,
    daysRemaining: investmentDuration,
    withdrawn: 0
};

const dashboard = {
    level: document.getElementById('level'),
    investment: document.getElementById('investment'),
    dailyProfit: document.getElementById('dailyProfit'),
    bonus: document.getElementById('bonus'),
    totalEarned: document.getElementById('totalEarned'),
    daysRemaining: document.getElementById('daysRemaining'),
    withdrawBtn: document.getElementById('withdrawBtn'),
    withdrawAmount: document.getElementById('withdrawAmount'),
    message: document.getElementById('message'),
    nextDayBtn: document.getElementById('nextDayBtn')
};

function updateDashboard() {
    dashboard.level.textContent = data.level;
    dashboard.investment.textContent = data.investment.toFixed(2);
    // Daily profit depends on level and investment, 5% of investment * level multiplier (1 + (level-1)*0.5)
    let levelMultiplier = 1 + (data.level - 1) * 0.5;
    let dailyProfit = data.investment * dailyProfitRate * levelMultiplier;
    dashboard.dailyProfit.textContent = dailyProfit.toFixed(2);
    dashboard.bonus.textContent = data.bonus.toFixed(2);
    let totalBalance = data.investment + data.profit + data.bonus - data.withdrawn;
    dashboard.totalEarned.textContent = totalBalance.toFixed(2);
    dashboard.daysRemaining.textContent = data.daysRemaining;

    if (totalBalance > 0) {
        dashboard.withdrawBtn.disabled = false;
        dashboard.withdrawAmount.max = totalBalance.toFixed(2);
    } else {
        dashboard.withdrawBtn.disabled = true;
        dashboard.withdrawAmount.value = "";
        dashboard.withdrawAmount.max = 0;
    }
}

function checkLevelUpgrade() {
    let profit = data.profit;
    if (profit >= levelThresholds[2]) {
        data.level = 4;
    } else if (profit >= levelThresholds[1]) {
        data.level = 3;
    } else if (profit >= levelThresholds[0]) {
        data.level = 2;
    } else {
        data.level = 1;
    }
}

function simulateDay() {
    data.day++;
    if (data.daysRemaining > 0) {
        data.daysRemaining--;
    }

    // Calculate daily profit with compounding effect
    let levelMultiplier = 1 + (data.level - 1) * 0.5;
    let dailyProfit = data.investment * dailyProfitRate * levelMultiplier;

    data.profit += dailyProfit;
    data.investment += dailyProfit; // compound profit reinvested

    // Add daily bonus only if user 'logs in' (clicks next day)
    data.bonus += dailyBonusAmount;

    checkLevelUpgrade();
    updateDashboard();
    saveData();
    dashboard.message.textContent = `Day ${data.day} simulated. Daily profit: P${dailyProfit.toFixed(2)}, Bonus added: P${dailyBonusAmount}`;
}

function withdraw() {
    let totalBalance = data.investment + data.profit + data.bonus - data.withdrawn;
    let amount = parseFloat(dashboard.withdrawAmount.value);
    if (isNaN(amount) || amount <= 0) {
        dashboard.message.textContent = 'Enter a valid withdrawal amount.';
        return;
    }
    if (amount > totalBalance) {
        dashboard.message.textContent = `Withdrawal amount exceeds available balance (P${totalBalance.toFixed(2)}).`;
        return;
    }
    data.withdrawn += amount;
    dashboard.message.textContent = `Withdrawal successful! Amount withdrawn: P${amount.toFixed(2)}`;
    dashboard.withdrawAmount.value = "";
    updateDashboard();
    saveData();
}

function saveData() {
    localStorage.setItem('kaboInvestData', JSON.stringify(data));
}

dashboard.nextDayBtn.addEventListener('click', simulateDay);
dashboard.withdrawBtn.addEventListener('click', withdraw);

// Initial update on page load
updateDashboard();
