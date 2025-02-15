<template>
  <ConfirmModal :show="showModal" @confirm="clearAll" @cancel="showModal = false">
  </ConfirmModal>
  <div id="app">
    <div>
      <div>
        <h1>Expense Splitter</h1>

        <!-- add participants -->
        <div class="items-center mobile:flex mobile:flex-col">
          <input
            v-model="personName"
            @keydown.enter="addPerson"
            type="text"
            maxlength="24"
            class="mobile:ml-4.5"
            placeholder="New Participant"
          />

          <button class="mobile:mt-3 min-h-12" @click="addPerson">Add Person</button>
        </div>
      </div>
    </div>
  </div>
  <div>{{ formatNames() }}</div>

  <div v-if="people.length > 1" class="card">
    <!-- <div class="card"> -->
    <h2>Enter Expenses:</h2>
    <div>
      <div class="mobile:flex-col self-center inputs-container">
        <select
          v-model="selectedPerson"
          id="people"
          class="mobile:ml-4.5 border-4 p-2 min-w-[8.5rem] people-dropdown"
        >
          <option v-if="!selectedPerson" value="" hidden selected>
            Who paid?
          </option>
          <option v-for="person in people" :key="person" :value="person">
            {{ person }}
          </option>
        </select>
        <div class="mobile:mt-3.5 flex flex-row">
          <span class="self-center dollarPrefix">$</span>
          <input
            v-model="paidAmount"
            @keydown.enter="addExpense"
            type="text"
            class="mobile:ml-1 expense-input"
            placeholder="How much?"
          />
        </div>
        <input
          v-model="notes"
          @keydown.enter="addExpense"
          type="text"
          class="mobile:ml-5 mobile:mt-3 notes-inputs"
          placeholder="Details (opt)"
        />
        <button
          @click="addExpense"
          class="mobile:mt-3 min-h-12"
          :disabled="
            !selectedPerson || !isNumber(paidAmount) || paidAmount <= 0
          "
        >
          Add Expense
        </button>
      </div>
    </div>
    <div v-if="expenses.length > 0" class="all-expenses">
      <div class="min-w-[50%] all-expenses-list">
        <div>
          <h3 class="all-expenses-header">All Expenses:</h3>
        </div>
        <div
          v-for="(expense, index) in expenses"
          :key="index"
          class="expense-entry"
        >
          <span class="expense-text">
            <strong>{{ expense.person }}</strong> paid: ${{ expense.amount
            }}{{ expense.notes ? ` (${expense.notes})` : "" }}
          </span>
          <button @click="removeExpense(index)" class="m-0 p-0 min-w-6.5 max-w-6.5 delete-btn">
            <span class="p-0 m-0"> &times; </span>
          </button>
        </div>
      </div>
    </div>
    <div v-if="expenses.length > 0" class="spend-list-container">
      <div class="min-w-[70%] spend-list">
        <div v-for="(expense, name) in mappedExpenses" :key="name">
          <strong>{{ name }}</strong> spent: ${{ expense }}
        </div>
      </div>
    </div>
    <div>
      <h2 v-if="expenses.length > 0 && totalSpent / people.length">
        Everyone should pay ${{
          parseFloat((totalSpent / people.length).toFixed(2))
        }}
      </h2>
      <template class="spend-list-container">
        <div
          v-if="expenses.length > 0 && totalSpent / people.length"
          class="min-w-[80%] pay-list"
        >
          <div v-for="settlement in cancelOutDebts(balances)" :key="settlement">
            {{ settlement }}
          </div>
        </div>
      </template>
    </div>
    <div>
      <button class="clear-btn min-h-12" @click="showModal = true">Clear All</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import ConfirmModal from './ConfirmModal.vue';

defineProps<{
  msg: string
}>();

const people = ref<string[]>(
  JSON.parse(localStorage.getItem("people") || "[]"),
);
const personName = ref("");
const selectedPerson = ref("");
const paidAmount = ref();
const notes = ref("");

const showModal = ref(false);

const addPerson = () => {
  //push whatever's in the input field to the people array
  const trimmedName = personName.value.trim();
  const capsName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
  if (trimmedName && !people.value.includes(capsName)) {
    people.value.push(capsName);
    personName.value = "";
    calculateOutstanding();
  }
  console.log(people.value);
};

const formatNames = () => {
  if (people.value.length === 0) {
    return "Welcome...";
  }
  let welcomemsg = "Welcome,";
  for (let i = 0; i < people.value.length; i++) {
    const capsName =
      people.value[i].charAt(0).toUpperCase() + people.value[i].slice(1);
    if (people.value.length >= 2 && i == people.value.length - 1) {
      welcomemsg += ` and ${capsName}`;
    } else if (i !== 0) {
      welcomemsg += `, ${capsName}`;
    } else {
      welcomemsg += ` ${capsName}`;
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
  mappedExpenses.value = {}; // people-wise expenses
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
    balances.value[person] = Number((mappedExpenses.value[person] - fairShare).toFixed(2)); // surplus of payment
  }
};

const addExpense = () => {
  try {
    if (
      selectedPerson.value.trim() &&
      isNumber(paidAmount.value) &&
      paidAmount.value > 0
    ) {
      expenses.value.push({
        person: selectedPerson.value,
        amount: paidAmount.value,
        notes: notes.value,
      });
      paidAmount.value = null;
      selectedPerson.value = "";
      notes.value = "";
      console.log(expenses.value);
    }
  } catch {
    return;
  }
  calculateOutstanding();
};

const isNumber = (amount: any) => {
  return !isNaN(parseFloat(amount)) && isFinite(amount);
};

const cancelOutDebts = (balances: { [key: string]: number }) => {
  const settlement = [];
  const remainingSurplus = { ...balances };

  for (const person1 of people.value) {
    // check if person1 owes
    if (remainingSurplus[person1] >= 0) continue; // does not owe

    for (const person2 of people.value) {
      if (remainingSurplus[person2] <= 0 || person1 === person2) continue; // if person2 is not owed anything
      console.log('person1', person1)
      console.log('person2', person2)

      const debt1 = -remainingSurplus[person1]; // if person1 paid $10 more than they should, they have -$10 debt
      const debt2 = -remainingSurplus[person2];
      console.log('debt1', debt1)
      console.log('debt2', debt2)

      if (debt1 > 0 && debt2 < 0) {
        const settlementAmount = Math.min(debt1, Math.abs(debt2));

        // person1 pays person2
        remainingSurplus[person1] += settlementAmount; // person1's 'surplus' ++ (paying off debt)
        remainingSurplus[person2] -= settlementAmount; // person2's 'surplus' -- (being paid)

        console.log(`${person1} pays $${parseFloat(settlementAmount.toFixed(2))} to ${person2}`)
        settlement.push(
          `${person1} pays $${parseFloat(settlementAmount.toFixed(2))} to ${person2}`,
        );

        // if the current person has finished paying off their owed amount, move on to the next person
        if (remainingSurplus[person1] === 0) {
          break;
        }
      }
    } 
  }
  Object.entries(remainingSurplus).forEach(([person, balance]) => {
    if (balance !== 0) {
      console.error('Individual not balanced')
      console.log('remaining balances', person, balance);
    }
  });
  return settlement;
};

const removeExpense = (index: number) => {
  expenses.value.splice(index, 1);
  calculateOutstanding();
};

const clearAll = () => {
  people.value = [];
  personName.value = "";
  selectedPerson.value = "";
  paidAmount.value = null;
  expenses.value = [];
  balances.value = {};
  mappedExpenses.value = {};
  totalSpent = 0;
  showModal.value = false;
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

onMounted(() => {
  calculateOutstanding();
});
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
