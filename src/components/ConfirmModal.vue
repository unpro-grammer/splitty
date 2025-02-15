<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" @click="cancel">
    <div class="bg-almost-white p-6 rounded-lg shadow-lg w-80 text-center max-w-[70vw]" @click.stop>
      <h2 class="text-lg text-almost-black font-semibold mb-4">Are you sure?</h2>
      <p class="text-almost-black mb-6">This action cannot be undone.</p>
      <div class="flex justify-center space-x-4">
        <button @click="confirm" class="px-4 py-2 !bg-[#625480] !text-[#f0f0f0] rounded hover:opacity-90 hover:border-almost-white hover:filter-none">
          Yes, clear all
        </button>
        <button @click="cancel" class="px-4 py-2 !bg-gray-600 !text-[#f0f0f0] rounded hover:opacity-90 hover:border-almost-white hover:filter-none">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  show: boolean
}>();

const emit = defineEmits([
  "confirm",
  "cancel"
]);

const confirm = () => {
  emit("confirm");
};
const cancel = () => {
  emit("cancel");
};

</script>