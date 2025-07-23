<template>
    <Modal :show="show" @close="handleClose" :cancelable="true">
        <template v-slot:header>
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200">Are you sure?</h3>
        </template>
        <template v-slot:body>
            <p class="text-gray-700 dark:text-gray-300">
                Are you sure you want to give up on the current roulette?
                Your progress will be lost for this attempt.
            </p>
        </template>
        <template v-slot:footer>
            <button
                @click="handleConfirm"
                class="rounded px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold"
            >
                Yes, give up
            </button>
            <button
                @click="handleClose"
                class="rounded px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
            >
                No, continue
            </button>
        </template>
    </Modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Modal from './Modal.vue'; // Ensure this path is correct

export default defineComponent({
    name: 'GiveUpModal',
    components: {
        Modal,
    },
    props: {
        show: Boolean, // Receives the show prop from App.vue
    },
    emits: ['confirm', 'close'], // Declares events it will emit

    setup(props, { emit }) {
        function handleConfirm() {
            console.log("GiveUpModal: 'Yes, give up' clicked. Emitting 'confirm'.");
            emit('confirm');
        }

        function handleClose() {
            console.log("GiveUpModal: 'No, continue' or overlay clicked. Emitting 'close'.");
            emit('close');
        }

        return {
            handleConfirm,
            handleClose,
        };
    },
});
</script>
