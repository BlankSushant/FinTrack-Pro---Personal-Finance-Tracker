const loginPage = document.querySelector("#loginPage");
const dashboard = document.querySelector("#dashboard");

const loginForm = document.querySelector("#loginForm");
const userName = document.querySelector("#userName");
const welcomeText = document.querySelector("#welcomeText");

const addTransaction = document.querySelector("#addTransaction");

const title = document.querySelector("#title");
const amount = document.querySelector("#amount");
const type = document.querySelector("#type");
const category = document.querySelector("#category");
const date = document.querySelector("#date");

const transactionList = document.querySelector("#transactionList");

const balance = document.querySelector("#balance");
const income = document.querySelector("#income");
const expense = document.querySelector("#expense");

const currency = document.querySelector("#currency");

const filterBtns = document.querySelectorAll(".filter");

const profileBtn = document.querySelector("#profileBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const themeBtn = document.querySelector("#themeBtn");

const profileModal = document.querySelector("#profileModal");
const modalName = document.querySelector("#modalName");
const modalCurrency = document.querySelector("#modalCurrency");
const saveModalProfile = document.querySelector("#saveModalProfile");
const closeProfile = document.querySelector("#closeProfile");

const resetModal = document.querySelector("#resetModal");
const confirmReset = document.querySelector("#confirmReset");
const cancelReset = document.querySelector("#cancelReset");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let currentFilter = "All";

let currentCurrency = localStorage.getItem("currency") || "INR";

const symbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
};

currency.value = currentCurrency;

function showDashboard() {
  loginPage.classList.add("hidden");
  dashboard.classList.remove("hidden");
}

function showLogin() {
  loginPage.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

const savedUser = localStorage.getItem("user");

if (savedUser) {
  showDashboard();

  welcomeText.textContent = `Welcome, ${savedUser}`;
} else {
  showLogin();
}

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (userName.value.trim() === "") return;

  localStorage.setItem("user", userName.value);

  welcomeText.textContent = `Welcome, ${userName.value}`;

  showDashboard();

  userName.value = "";

  renderTransactions();

  updateSummary();

  updateChart();
});

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("user");

  showLogin();
});

function formatCurrency(value) {
  return `${symbols[currentCurrency]}${value.toFixed(2)}`;
}

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === "Income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  income.textContent = formatCurrency(totalIncome);

  expense.textContent = formatCurrency(totalExpense);

  balance.textContent = formatCurrency(totalIncome - totalExpense);
}

function createTransaction(transaction, index) {
  const li = document.createElement("li");

  const left = document.createElement("div");
  left.className = "transactionInfo";

  const titleElement = document.createElement("span");
  titleElement.className = "transactionTitle";
  titleElement.textContent = transaction.title;

  const categoryElement = document.createElement("span");
  categoryElement.className = "transactionCategory";
  categoryElement.textContent = `${transaction.category} • ${transaction.type}`;

  const dateElement = document.createElement("span");
  dateElement.className = "transactionDate";
  dateElement.textContent = transaction.date;

  left.append(titleElement);
  left.append(categoryElement);
  left.append(dateElement);

  const right = document.createElement("div");

  const amountElement = document.createElement("span");

  amountElement.className = "transactionAmount";

  if (transaction.type === "Income") {
    amountElement.classList.add("incomeAmount");

    amountElement.textContent = "+ " + formatCurrency(transaction.amount);
  } else {
    amountElement.classList.add("expenseAmount");

    amountElement.textContent = "- " + formatCurrency(transaction.amount);
  }

  const deleteBtn = document.createElement("button");

  deleteBtn.className = "deleteBtn";

  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", function () {
    transactions.splice(index, 1);

    saveTransactions();

    renderTransactions();

    updateSummary();

    updateChart();
  });

  right.append(amountElement);
  right.append(document.createElement("br"));
  right.append(deleteBtn);

  li.append(left);
  li.append(right);

  transactionList.append(li);
}

function renderTransactions() {
  transactionList.innerHTML = "";

  transactions.forEach(function (transaction, index) {
    if (currentFilter === "All") {
      createTransaction(transaction, index);
    } else if (currentFilter === transaction.type) {
      createTransaction(transaction, index);
    }
  });
}

addTransaction.addEventListener("submit", function (e) {
  e.preventDefault();

  const transaction = {
    title: title.value,

    amount: Number(amount.value),

    type: type.value,

    category: category.value,

    date: date.value,
  };

  transactions.push(transaction);

  saveTransactions();

  renderTransactions();

  updateSummary();

  updateChart();

  addTransaction.reset();
});

filterBtns.forEach(function (button) {
  button.addEventListener("click", function () {
    filterBtns.forEach(function (btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    currentFilter = button.dataset.filter;

    renderTransactions();
  });
});

renderTransactions();

updateSummary();

let chart;

function updateChart() {
  const incomeData = transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const expenseData = transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const ctx = document.querySelector("#financeChart");

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          label: "Amount",
          data: [incomeData, expenseData],
          backgroundColor: ["#22c55e", "#ef4444"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

profileBtn.addEventListener("click", function () {
  modalName.value = localStorage.getItem("user") || "";

  modalCurrency.value = currentCurrency;

  profileModal.classList.remove("hidden");
});

closeProfile.addEventListener("click", function () {
  profileModal.classList.add("hidden");
});

saveModalProfile.addEventListener("click", function () {
  const name = modalName.value.trim();

  if (name === "") return;

  localStorage.setItem("user", name);

  welcomeText.textContent = `Welcome, ${name}`;

  currentCurrency = modalCurrency.value;

  currency.value = currentCurrency;

  localStorage.setItem("currency", currentCurrency);

  updateSummary();

  renderTransactions();

  profileModal.classList.add("hidden");
});

currency.addEventListener("change", function () {
  currentCurrency = currency.value;

  localStorage.setItem("currency", currentCurrency);

  updateSummary();

  renderTransactions();
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");

  themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");

    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  } else {
    localStorage.setItem("theme", "light");

    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  }
});

resetData.addEventListener("click", function () {
  resetModal.classList.remove("hidden");
});

cancelReset.addEventListener("click", function () {
  resetModal.classList.add("hidden");
});

confirmReset.addEventListener("click", function () {
  localStorage.clear();

  transactions = [];

  transactionList.innerHTML = "";

  updateSummary();

  updateChart();

  resetModal.classList.add("hidden");

  showLogin();
});

window.addEventListener("click", function (e) {
  if (e.target === profileModal) {
    profileModal.classList.add("hidden");
  }

  if (e.target === resetModal) {
    resetModal.classList.add("hidden");
  }
});

updateChart();
