<template>
    <div :class="{ active: active }" class="demon-card">
        <!-- ... existing demon display content ... -->
        <p>{{ demon.name }} by {{ demon.creator }}</p>
        <p>Position: {{ demon.position }}</p>
        <p>Target Percent: {{ percent }}%</p>
        <!-- ... other demon details ... -->

        <div v-if="active" class="flex justify-center gap-4 mt-4">
            <button @click="emitDone" class="bg-green-500 text-white px-4 py-2 rounded">Done</button>
            <button @click="emitGiveUp" class="bg-red-500 text-white px-4 py-2 rounded">Give Up</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { SimplifiedDemon } from '../types'; // Adjust path if needed

export default defineComponent({
    props: {
        demon: {
            type: Object as () => SimplifiedDemon,
            required: true,
        },
        active: Boolean,
        currentPercent: Number,
        percent: Number,
    },
    emits: ['done', 'give-up'], // Declare emitted events

    setup(props, { emit }) {
        function emitDone() {
            console.log(`Demon.vue: Emitting 'done' for ${props.demon.name} with percent ${props.percent}`);
            emit('done', props.percent);
        }

        function emitGiveUp() {
            console.log(`Demon.vue: Emitting 'give-up' for ${props.demon.name}`);
            emit('give-up');
        }

        return {
            emitDone,
            emitGiveUp,
        };
    },
});
</script>

<style scoped>
/* Add some basic styling for .demon-card if it's not already in your CSS */
.demon-card {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    width: 80%;
    max-width: 400px;
    margin-bottom: 20px;
}
.dark .demon-card {
    background-color: #333;
    border-color: #555;
    color: #eee;
}
.demon-card.active {
    border-color: blue;
    box-shadow: 0 0 10px rgba(0, 0, 255, 0.5);
}
</style>
