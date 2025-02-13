<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const people = ref([]);
const personName = ref("");
const selectedPerson = ref("");

const addPerson = () => {
  //push whatever's in the input field to the people array
  if (personName.value.trim()) {
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

const count = ref(0);
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
        <input
        v-model="personName"
        @keydown.enter="addPerson"
        type="text"
        class="expense-input"
        placeholder="How much?"
      />
      <button @click="addPerson">Add Expense</button>
      </div>
      
    </div>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
