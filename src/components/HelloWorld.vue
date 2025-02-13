<script setup lang="ts">
import { ref, watch } from "vue";

defineProps<{ msg: string }>();

const people = ref<string[]>(
  JSON.parse(localStorage.getItem("people") || "[]"),
);
const personName = ref("");
const selectedPerson = ref("");
const paidAmount = ref(0);

const addPerson = () => {
  //push whatever's in the input field to the people array
  if (personName.value.trim() && !people.value.includes(personName.value)) {
    people.value.push(personName.value);
    personName.value = "";
  }
  console.log(people.value);
};

const formatNames = () => {
  if (people.value.length === 0) {
    return "Welcome...";
  }
  let welcomemsg = "Welcome,";
  for (let i = 0; i < people.value.length; i++) {
    if (people.value.length >= 2 && i == people.value.length - 1) {
      welcomemsg += ` and ${people.value[i]}`;
    } else if (i !== 0) {
      welcomemsg += `, ${people.value[i]}`;
    } else {
      welcomemsg += ` ${people.value[i]}`;
    }
  }
  return welcomemsg;
};

const expenses = ref<any[]>(
  JSON.parse(localStorage.getItem("expenses") || "[]"),
);
const balances = ref<{ [key: string]: number }>(
  JSON.parse(localStorage.getItem("balances") || "{}"),
);

const mappedExpenses = ref<{ [key: string]: number }>(
  JSON.parse(localStorage.getItem("mappedExpenses") || "{}"),
);

let totalSpent = 0;

const calculateOutstanding = () => {
  mappedExpenses.value = {};
  for (const person of people.value) {
    mappedExpenses.value[person] = 0;
    balances.value[person] = 0;
    console.log(mappedExpenses.value);
    // for (const expense of expenses.value) {
    //   mappedExpenses.value[ex] = ;
    // }
  }
  for (const expense of expenses.value) {
    mappedExpenses.value[expense.person] += Number(expense.amount);
  }

  // calculate dues
  totalSpent = expenses.value.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0,
  );
  const numPeople = people.value.length;

  const fairShare = totalSpent / numPeople;

  for (const person of people.value) {
    balances.value[person] = mappedExpenses.value[person] - fairShare;
  }
};

const addExpense = () => {
  try {
    const numericalAmount = parseInt(paidAmount.value);
    if (selectedPerson.value.trim() && paidAmount.value > 0) {
      expenses.value.push({
        person: selectedPerson.value,
        amount: paidAmount.value,
      });
      paidAmount.value = 0;
      selectedPerson.value = "";
      console.log(expenses.value);
    }
  } catch {
    return;
  }
  calculateOutstanding();
};

const cancelOutDebts = (balances: { [key: string]: number }) => {
  const settlement = [];
  const remainingBalances = { ...balances };

  for (const person1 of people.value) {
    if (remainingBalances[person1] === 0) continue;

    for (const person2 of people.value) {
      if (remainingBalances[person2] === 0 || person1 === person2) continue;

      const debt1 = -remainingBalances[person1];
      const debt2 = -remainingBalances[person2];

      if (debt1 > 0 && debt2 < 0) {
        const settlementAmount = Math.min(debt1, Math.abs(debt2));

        // person1 pays person2
        remainingBalances[person1] -= settlementAmount;
        remainingBalances[person2] += settlementAmount;

        settlement.push(
          `${person1} pays $${parseFloat(settlementAmount.toFixed(2))} to ${person2}`,
        );

        if (
          remainingBalances[person1] === 0 ||
          remainingBalances[person2] === 0
        )
          break;
      }
    }
  }

  return settlement;
};

const clearAll = () => {
  people.value = [];
  personName.value = "";
  selectedPerson.value = "";
  paidAmount.value = 0;
  expenses.value = [];
  balances.value = {};
  mappedExpenses.value = {};
  totalSpent = 0;
};

watch(
  [people, expenses, balances, mappedExpenses],
  () => {
    localStorage.setItem("people", JSON.stringify(people.value));
    localStorage.setItem("expenses", JSON.stringify(expenses.value));
    localStorage.setItem("balances", JSON.stringify(balances.value));
    localStorage.setItem(
      "mappedExpenses",
      JSON.stringify(mappedExpenses.value),
    );
  },
  { deep: true },
);
</script>

<template>
  <div id="app">
    <div>
      <div>
        <h1>Expense Tracker</h1>

        <!-- add participants -->
        <div>
          <input
            v-model="personName"
            @keydown.enter="addPerson"
            type="text"
            placeholder="New Participant"
          />

          <button @click="addPerson">Add Person</button>
        </div>
      </div>
    </div>
  </div>
  <div>{{ formatNames() }}</div>

  <div v-if="people.length > 1" class="card">
    <h2>Enter Expenses:</h2>
    <div>
      <div>
        <select v-model="selectedPerson" id="people" class="people-dropdown">
          <option value="" disabled selected>Who paid?</option>
          <option v-for="person in people" :key="person" :value="person">
            {{ person }}
          </option>
        </select>
        <span class="dollarPrefix">$</span>
        <input
          v-model="paidAmount"
          @keydown.enter="addExpense"
          type="text"
          class="expense-input"
          placeholder="How much?"
        />
        <button @click="addExpense">Add Expense</button>
      </div>
    </div>
    <div class="spend-list">
      <div v-for="(expense, name) in mappedExpenses" :key="name">
        {{ name }} spent: ${{ expense }}
      </div>
    </div>
    <div>
      <h2>Settlements:</h2>
      <h3>
        Everyone should pay ${{
          parseFloat((totalSpent / people.length).toFixed(2))
        }}
      </h3>
      <div v-for="settlement in cancelOutDebts(balances)" :key="settlement">
        {{ settlement }}
      </div>
    </div>
    <div>
      <button class="clear-btn" @click="clearAll">Clear All</button>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
