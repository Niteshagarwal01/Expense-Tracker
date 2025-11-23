// DOM Elements Cache
const DOM = {
  balance: document.getElementById("balance"),
  incomeAmount: document.getElementById("income-amount"),
  expenseAmount: document.getElementById("expense-amount"),
  transactionList: document.getElementById("transaction-list"),
  transactionForm: document.getElementById("transaction-form"),
  description: document.getElementById("description"),
  amount: document.getElementById("amount"),
  category: document.getElementById("category"),
  date: document.getElementById("date"),
  searchInput: document.getElementById("search-input"),
  categoryFilter: document.getElementById("category-filter")
};

// State
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editingId = null;
let chart = null;

// Constants
const COLORS = ['#059669', '#047857', '#065f46', '#064e3b', '#022c22', '#16a34a', '#15803d', '#166534', '#14532d', '#052e16'];
const CURRENCY_FORMAT = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

// Utility Functions
const formatCurrency = amount => CURRENCY_FORMAT.format(amount);
const formatDate = dateString => DATE_FORMAT.format(new Date(dateString));
const saveTransactions = () => localStorage.setItem("transactions", JSON.stringify(transactions));
const getTransactionById = id => transactions.find(t => t.id === id);
const updateUI = () => {
  updateTransactionList();
  updateSummary();
  updateChart();
};

// Event Handlers
const handleFormSubmit = e => {
  e.preventDefault();
  editingId ? updateTransaction(editingId) : addTransaction();
};

const handleFilter = () => {
  const search = DOM.searchInput.value.toLowerCase();
  const category = DOM.categoryFilter.value;
  const filtered = transactions.filter(t =>
    (!search || t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search)) &&
    (!category || t.category === category)
  );
  updateTransactionList(filtered);
};

// Main Functions
function addTransaction() {
  const data = {
    description: DOM.description.value.trim(),
    amount: parseFloat(DOM.amount.value),
    category: DOM.category.value,
    date: DOM.date.value
  };

  if (!data.category) return alert("Please select a category");

  transactions.push({ id: Date.now(), ...data });
  saveTransactions();
  updateUI();
  resetForm();
}

function updateTransactionList(filtered = null) {
  const list = filtered || [...transactions].reverse();
  DOM.transactionList.innerHTML = list.map(createTransactionElement).join('');
}

function createTransactionElement(t) {
  const isIncome = t.amount > 0;
  return `
    <li class="transaction ${isIncome ? 'income' : 'expense'}">
      <div class="transaction-info">
        <span class="transaction-description">${t.description}</span>
        <span class="transaction-category">${t.category.charAt(0).toUpperCase() + t.category.slice(1)}</span>
        <span class="transaction-date">${formatDate(t.date)}</span>
      </div>
      <span class="transaction-amount">
        ${formatCurrency(t.amount)}
        <button class="edit-btn" onclick="editTransaction(${t.id})" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" onclick="removeTransaction(${t.id})" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </span>
    </li>
  `;
}

function editTransaction(id) {
  const t = getTransactionById(id);
  if (!t) return;

  editingId = id;
  Object.assign(DOM, {
    description: { value: t.description },
    amount: { value: t.amount },
    category: { value: t.category },
    date: { value: t.date }
  });

  document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Update';
  document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

function updateTransaction(id) {
  const data = {
    description: DOM.description.value.trim(),
    amount: parseFloat(DOM.amount.value),
    category: DOM.category.value,
    date: DOM.date.value
  };

  if (!data.category) return alert("Please select a category");

  const index = transactions.findIndex(t => t.id === id);
  if (index === -1) return;

  transactions[index] = { ...transactions[index], ...data };
  saveTransactions();
  updateUI();
  resetForm();
}

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveTransactions();
  updateUI();
}

function updateChart() {
  const ctx = document.getElementById('expenseChart');
  if (!ctx) return;

  const categoryTotals = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => {
      const cat = t.category;
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
      datasets: [{
        data,
        backgroundColor: COLORS.slice(0, labels.length),
        borderColor: COLORS.slice(0, labels.length).map(c => c + '80'),
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverBorderColor: '#FFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true, font: { size: 12, family: 'Poppins' } } },
        tooltip: {
          callbacks: { label: ctx => `${ctx.label}: ${formatCurrency(ctx.parsed)}` },
          backgroundColor: 'rgba(5, 150, 105, 0.9)',
          titleColor: '#FFF',
          bodyColor: '#FFF',
          cornerRadius: 8
        }
      },
      animation: { animateScale: true, animateRotate: true, duration: 1000, easing: 'easeOutBounce' }
    }
  });
}

function updateSummary() {
  const { income, expense } = transactions.reduce((acc, t) => {
    if (t.amount > 0) acc.income += t.amount;
    else acc.expense += Math.abs(t.amount);
    return acc;
  }, { income: 0, expense: 0 });

  DOM.balance.textContent = formatCurrency(income - expense);
  DOM.incomeAmount.textContent = formatCurrency(income);
  DOM.expenseAmount.textContent = formatCurrency(expense);
}

function resetForm() {
  DOM.transactionForm.reset();
  DOM.date.valueAsDate = new Date();
  editingId = null;
  document.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-save"></i> Add Transaction';
}

// Event Listeners
DOM.transactionForm.addEventListener("submit", handleFormSubmit);
DOM.searchInput.addEventListener("input", handleFilter);
DOM.categoryFilter.addEventListener("change", handleFilter);

// Initialize
updateUI();
DOM.date.valueAsDate = new Date();
