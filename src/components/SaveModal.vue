<template>
    <Transition name="modal">
        <div v-if="show" class="modal-mask">
            <div class="modal-wrapper">
                <div class="modal-container dark:bg-plain-gray-dark rounded-lg shadow-xl p-6">
                    <div class="modal-header">
                        <h3 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Save/Load Game</h3>
                    </div>

                    <div class="modal-body my-4">
                        <p class="text-gray-700 dark:text-gray-300 mb-4">
                            You can save your current roulette progress or load a previously saved game.
                        </p>

                        <div class="flex flex-col gap-4">
                            <!-- Save Button -->
                            <button
                                @click="handleSaveClick"
                                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                            >
                                Save Current Game
                            </button>

                            <!-- Load Section -->
                            <label class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
                                Load Game:
                            </label>
                            <input
                                type="file"
                                @change="handleFileChange"
                                accept=".mp"
                                class="block w-full text-sm text-gray-500 dark:text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-violet-50 file:text-violet-700
                                    hover:file:bg-violet-100"
                            />
                        </div>
                    </div>

                    <div class="modal-footer flex justify-end gap-3 mt-6">
                        <button
                            class="rounded px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                            @click="$emit('close')"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        show: {
            type: Boolean,
            required: true,
        },
    },
    emits: ['close', 'save', 'load'], // 'save' event is new, 'load' is for passing the file

    setup(props, { emit }) {
        const handleSaveClick = () => {
            // Emit a 'save' event to the parent (App.vue)
            emit('save');
            // Close the modal after triggering save
            emit('close');
        };

        const handleFileChange = (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                // Emit a 'load' event with the selected file
                emit('load', file);
                // Close the modal after selecting file
                emit('close');
            }
        };

        return {
            handleSaveClick,
            handleFileChange,
        };
    },
});
</script>

<style scoped>
.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    transition: opacity 0.3s ease;
    justify-content: center;
    align-items: center;
}

.modal-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.modal-container {
    min-width: 300px;
    max-width: 500px;
    margin: auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
    margin-top: 0;
    color: #42b983;
}

.modal-body {
    margin: 20px 0;
}

.modal-default-button {
    float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter-from {
    opacity: 0;
}

.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
}
</style>
