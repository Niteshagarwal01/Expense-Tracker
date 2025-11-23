# Expense Tracker — Project Guide(Small Build#3)
<img width="1200" alt="expense-tracker-screenshot" src="https://user-images.githubusercontent.com/placeholder/expense-screenshot.png" />

A lightweight, responsive web app to track personal expenses. Add, remove, and filter expenses and see running totals and category breakdowns — all with vanilla HTML/CSS/JavaScript.

## 🚀 Features

  * **Add Expenses:** Record an expense with title, amount, category, and date.
  * **Delete/Edit:** Remove expenses (and optionally edit entries by changing fields in the UI).
  * **Summary Dashboard:** Shows total expenses, current balance (income − expenses), and category totals.
  * **Filter & Sort:** Filter by category and date range; sort by date or amount.
  * **Local Persistence:** Uses `localStorage` so data persists between browser sessions.

## 🛠️ Tech Stack

  * **Frontend:** HTML5, CSS3 (responsive design)
  * **Logic:** Vanilla JavaScript (ES6+) using DOM APIs and `localStorage`.

## 📂 File Structure

  * `index.html` - Main UI: forms for adding expenses, a list/table for entries, and a summary panel.
  * `style.css` - Styling for forms, cards, tables, and responsive layout.
  * `script.js` - Core logic for adding, removing, filtering expenses, and updating `localStorage`.

## ⚙️ How It Works

At a high level the app performs these steps:

1. `init()` — Reads saved expenses from `localStorage` (if any) and renders the UI.
2. `addExpense()` — Validates form input, appends a new expense object to the list, saves to `localStorage`, and re-renders.
3. `removeExpense(id)` — Removes the expense with the given id, updates storage, and re-renders.
4. `renderSummary()` — Calculates total, per-category totals, and updates the dashboard.
5. `applyFilters()` — Filters the in-memory list by date/category and re-renders the list and summary.

Code snippets (verbatim from `script.js`):

Add transaction (form submit handler):

```javascript
function addTransaction(e) {
  e.preventDefault();

  // get form values
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);

  transactions.push({
    id: Date.now(),
    description,
    amount,
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();

  transactionFormEl.reset();
}
```

Render/update the transaction list:

```javascript
function updateTransactionList() {
  transactionListEl.innerHTML = "";

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}
```

Create a transaction list item element:

```javascript
function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");

  li.innerHTML = `
    <span>${transaction.description}</span>
    <span>
  
    ${formatCurrency(transaction.amount)}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    </span>
  `;

  return li;
}
```

Summary calculations and UI updates:

```javascript
function updateSummary() {
  // 100, -50, 200, -200 => 50
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // update ui => todo: fix the formatting
  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}
```

Currency formatting helper:

```javascript
function formatCurrency(number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}
```

Remove transaction (deletes and updates storage/UI):

```javascript
function removeTransaction(id) {
  // filter out the one we wanted to delete
  transactions = transactions.filter((transaction) => transaction.id !== id);

  localStorage.setItem("transcations", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();
}
```

Initial render (called on load):

```javascript
// initial render
updateTransactionList();
updateSummary();
```

## 💻 Run Locally

1. Download or clone the project files into a folder.
2. Open `index.html` in your browser (double-click or use "Open File" in the browser).
3. Add an expense via the form. The app uses `localStorage` so entries persist on the same machine/browser.

## 🔧 Customization

  * **Change currency:** Update any currency symbols in `style.css` or formatting code in `script.js` (e.g., toLocaleString options).
  * **Default categories:** Modify the category list in `index.html` or in `script.js` where options are generated.
  * **Export/Import:** Add JSON export/import by serializing the `expenses` array and providing a file input/download link.

## 📝 Notes & Limitations

  * This is a client-side only demo; `localStorage` is per-browser and not synced across devices.
  * For multi-user or secure data storage, connect to a backend (Firebase, REST API) and add authentication.
  * There are no heavy validations or currency conversions; expand validation for production use.

-----

*Contributions welcome — feel free to open issues or create PRs to add features or fixes.*
