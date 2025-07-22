<template>
    <main :class="{ dark: darkMode }">
        <div class="w-screen h-screen fixed -z-10 dark:bg-plain-gray"></div>
        <div class="flex justify-center">
            <div class="flex flex-col">
                <h1
                    class="md:absolute md:left-1/2 md:top-3 md:transform-gpu md:-translate-x-1/2 mt-5 text-3xl font-medium text-center text-gray-800 dark:text-gray-200 cursor-help md:border-b-2 border-dashed hover:border-gray-600 dark:border-gray-600 dark:hover:border-gray-300"
                    @click="showAboutModal = true"
                >
                    Extreme Demon Roulette
                    <p v-if="useOldList">2017 List</p>
                </h1>
                <div class="flex mt-5 mx-3 justify-between items-center">
                    <div class="flex flex-col text-gray-800 dark:text-gray-300">
                        <label>
                            <input type="checkbox" v-model="selectedLists.main" :disabled="useOldList" />
                            Main list
                        </label>
                        <label v-if="!useOldList">
                            <input type="checkbox" v-model="selectedLists.extended" />
                            Extended list
                        </label>
                        <label>
                            <input type="checkbox" v-model="excludeRouletteDemons" />
                            Exclude levels from ongoing roulette
                        </label>
                    </div>
                    <div class="flex">
                        <button
                            @click="showSaveModal = true"
                            class="text-white rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 mr-2"
                        >
                            Save
                        </button>
                        <button
                            @click="start()"
                            class="text-white rounded px-4 py-2"
                            :class="{
                                'bg-green-500 hover:bg-green-600': !playing,
                                'bg-red-500 hover:bg-red-600': playing,
                                'opacity-60 cursor-not-allowed': fetching,
                            }"
                            :disabled="fetching"
                        >
                            {{ playing ? 'Restart' : 'Start' }}
                        </button>
                    </div>
                </div>
                <div class="flex flex-col items-center w-screen max-w-7xl gap-5 mt-10">
                    <demon
                        v-for="(demon, i) in currentDemons"
                        :key="i"
                        :demon="demon"
                        :active="playing && i === currentDemon"
                        :currentPercent="currentPercent"
                        :percent="percents[i]"
                        @done="demonDone"
                        @give-up="showGiveUpModal = true"
                    />
                </div>
                <article
                    v-if="showResults"
                    class="flex flex-col items-center mt-5 p-5 shadow-lg w-full"
                >
                    <h2 class="text-3xl font-medium text-gray-800 dark:text-gray-200">Results</h2>
                    <section class="text-xl mt-4 text-center dark:text-gray-200">
                        <p>Number of demons: {{ percents.length }}</p>
                        <p>Highest percent: {{ currentPercent - 1 }}%</p>
                    </section>
                    <button
                        @click="showRemaining = true"
                        v-if="currentPercent < 100"
                        class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        Show remaining demons
                    </button>
                </article>

                <teleport to="body">
                    <Modal v-if="showAboutModal" @close="showAboutModal = false">
                        <template v-slot:header>
                            <h3>About the Extreme Demon Roulette</h3>
                        </template>
                        <template v-slot:body>
                            <p class="mb-2">
                                The Extreme Demon Roulette is a challenge where you try to get a certain percent on extreme
                                demons, starting at 1% and increasing by 1% for each demon. If you reach 100%, you
                                win the roulette.
                            </p>
                            <p class="mb-2">
                                All demons come from the official <a href="https://pointercrate.com/" target="_blank" class="text-blue-500 hover:underline">Pointercrate Demonlist</a>,
                                unless you activate the 2017 list via a URL parameter (try adding <code class="bg-gray-200 dark:bg-gray-700 p-1 rounded">?2017</code> to the URL).
                            </p>
                            <p>
                                Created by <a href="https://github.com/zmxv" target="_blank" class="text-blue-500 hover:underline">zmxv</a> and adapted for your needs.
                            </p>
                        </template>
                        <template v-slot:footer>
                            <button
                                class="rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
                                @click="showAboutModal = false"
                            >
                                Close
                            </button>
                        </template>
                    </Modal>
                </teleport>

                <teleport to="body">
                    <GiveUpModal v-if="showGiveUpModal" @confirm="giveUp" @close="showGiveUpModal = false" />
                </teleport>

                <teleport to="body">
                    <SaveModal v-if="showSaveModal" @close="onSaveModalClose" />
                </teleport>

                <teleport to="body">
                    <Modal v-if="showRemaining" @close="showRemaining = false">
                        <template v-slot:header>
                            <h3>Remaining Demons</h3>
                        </template>
                        <template v-slot:body>
                            <div class="flex flex-col gap-2">
                                <div v-for="(demon, i) in remainingDemons" :key="i">
                                    {{ demon.position }}. {{ demon.name }} by {{ demon.creator }}
                                </div>
                            </div>
                        </template>
                        <template v-slot:footer>
                            <button
                                class="rounded px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
                                @click="showRemaining = false"
                            >
                                Close
                            </button>
                        </template>
                    </Modal>
                </teleport>

                <button
                    class="fixed bottom-5 right-5 w-12 h-12 rounded-full shadow-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200 text-2xl"
                    @click="darkMode = !darkMode"
                >
                    🌙
                </button>
            </div>
        </div>
    </main>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onUnmounted, watchEffect } from 'vue';
import Demon from './components/Demon.vue';
import Modal from './components/Modal.vue';
import SaveModal from './components/SaveModal.vue';
import GiveUpModal from './components/GiveUpModal.vue';
import { RouletteState, SimplifiedDemon } from './types';
import { shuffle, clearArray } from './utils'; // Ensure this path is correct and clearArray is generic
import { unloadHandler } from './unloadHandler';
import { veryOldDemons } from './veryOldList'; // Ensure this path is correct
import { simplifyDemon, compressState, decompressState } from './save';
import { saveAs } from 'file-saver';

export default defineComponent({
    components: {
        Demon,
        Modal,
        SaveModal,
        GiveUpModal,
    },
    setup() {
        // --- Reactive State Variables (Declared ONCE here) ---
        const selectedLists = reactive({
            main: true,
            extended: true,
            legacy: false,
        });

        // The main array holding the demons for the roulette.
        // It's declared as a reactive array of SimplifiedDemon.
        let demons = reactive([] as SimplifiedDemon[]);

        const playing = ref(false);
        const fetching = ref(false); // Indicates if data is being fetched/processed

        // Old list mode from URL parameter
        const useOldList = computed(() => window.location.search.includes('2017'));

        // New reactive variable for the "Exclude Ongoing Roulette Levels" option
        const excludeRouletteDemons = ref(false);

        // Current demon being played and its current percentage
        const currentDemon = ref(0);
        const currentPercent = ref(1);
        const percents = reactive([] as number[]); // Stores percentages achieved for each demon

        // Modals and UI visibility controls
        const showRemaining = ref(false);
        const showGiveUpModal = ref(false);
        const showSaveModal = ref(false);
        const showAboutModal = ref(false);

        // Dark mode control
        const darkMode = ref(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));

        // --- Constants ---
        // List of demon names to exclude for the ongoing roulette
        const ONGOING_ROULETTE_EXCLUSIONS = new Set<string>([ // Explicitly typed as Set<string>
            "Ethereal Artifice",
            "Carnage Mode",
            "Zodiac",
            "Glowy",
            "Audio Expulsion",
            "GridLocked",
            "WaveBreaker",
            "The Hell Zone",
            "Shock Therapy",
            "Renevant",
            "The Hell Factory",
            "Novalis",
            "Spacial Rend",
            "Niflheim",
            "Arctic Arena",
            "Ithacropolis",
            "The Hell World",
            "The Hell Origin",
            "Conical Depression",
            "Penultimate Phase",
            "Bausha Vortex",
            "Elite Z Rebirth",
            "Prismatic Haze",
            "Devil Vortex",
            "Rate Demon",
            "Delta Interface",
            "Phobos",
            "Digital Descent",
            "Down Bass by Spectra",
            "Asmodeus",
            "The Hell Dignity",
            "Ouroboros",
            "Omega",
            "Lucid Nightmares",
        ]);

        // --- Lifecycle Hooks & Handlers ---
        // This stops the unload handler when the component is unmounted
        const stopHandler = unloadHandler(playing);
        onUnmounted(() => {
            stopHandler();
        });

        // Watch for changes in darkMode and update localStorage
        watchEffect(() => {
            localStorage.setItem('theme', darkMode.value ? 'dark' : 'light');
        });

        // --- Functions ---

        // Function to start/restart the roulette
        async function start() {
            if (fetching.value) return; // Prevent multiple clicks while data is being processed
            // Ensure at least one list type is selected (main, extended, legacy)
            if (!(selectedLists.main || (selectedLists.extended && !useOldList.value))) {
                console.warn("Please select at least one list type (Main or Extended) to start the roulette.");
                return;
            }

            playing.value = true;
            fetching.value = true; // Set fetching state
            showRemaining.value = false; // Hide remaining demons section

            // Clear the reactive array of demons
            clearArray(demons); // This calls the generic clearArray<T>(arr: T[])

            // Load all demons from your veryOldDemons list into a temporary array first
            // This is crucial to avoid issues with directly pushing into a potentially re-declared reactive object.
            const allDemonsFromSource: SimplifiedDemon[] = [...veryOldDemons]; // Use spread to create a new array

            // Define specific positions to always exclude
            const positionsToExclude: Set<number> = new Set([
                // Add any other specific positions you want to exclude here (which you can get from veryOldList.ts)
            ]);

            // Define specific demon names to always exclude (beyond the main roulette exclusions)
            const namesToExclude: Set<string> = new Set([ // Explicitly typed as Set<string>
                // Add specific names here if needed: "Another Demon Name", "Some Other Demon",
            ]);

            // Apply all filtering rules to allDemonsFromSource
            const filteredDemons = allDemonsFromSource.filter(demon => {
                // Rule 1: Exclude by specific position
                if (positionsToExclude.has(demon.position)) {
                    return false;
                }

                // Rule 2: Exclude by specific name (other than the ongoing roulette list)
                if (namesToExclude.has(demon.name)) {
                    return false;
                }

                // Rule 3: Exclude entries that are incomplete (e.g., no video link, empty creator/link)
                if (demon.video === null || demon.creator === "" || demon.link === "") {
                     return false;
                }

                // Rule 4: Conditional exclusion for ongoing roulette levels (based on checkbox state)
                if (excludeRouletteDemons.value && ONGOING_ROULETTE_EXCLUSIONS.has(demon.name)) {
                    return false;
                }

                return true; // Include the demon if it passes all exclusion checks
            });

            // Populate the 'demons' reactive array with the filtered results
            demons.push(...filteredDemons);

            fetching.value = false; // Data processing is complete
            shuffle(demons); // Shuffle the now-filtered list in place (your shuffle returns the array, but also modifies in place)

            currentDemon.value = 0; // Start at the first demon
            currentPercent.value = 1; // Reset percentage for the new run
            clearArray(percents); // Clear percentage history
        }

        // Handles a demon completion event (when a demon is passed/done)
        function demonDone(percent: number) {
            // Basic validation: ensure percent is a number and not less than the current required percent
            if (isNaN(percent) || percent < currentPercent.value) {
                console.warn(`Invalid percent received: ${percent}. Must be a number and greater than or equal to ${currentPercent.value}`);
                return;
            }

            if (percent >= 100) {
                // If 100% or more is achieved, the challenge ends
                percent = 100; // Cap at 100%
                playing.value = false;
            } else if (currentDemon.value >= demons.length - 1) {
                // If all available demons have been gone through, but 100% wasn't hit
                playing.value = false;
            } else {
                // Move to the next demon in the sequence
                currentDemon.value++;
            }
            currentPercent.value = percent + 1; // Set the next target percentage
            percents.push(percent); // Record the percentage achieved for the current demon
        }

        // Handles giving up the roulette challenge
        function giveUp() {
            showGiveUpModal.value = false; // Close the modal
            playing.value = false; // Stop the game
        }

        // Saves the current game state to a file
        function save() {
            const state: RouletteState = {
                playing: playing.value,
                selectedLists,
                demons: demons,
                current: currentDemon.value,
                percent: currentPercent.value,
                percents: percents,
            };
            const data = compressState(state); // Compress the state into a storable format
            const blob = new Blob([data], { type: 'application/msgpack' }); // Create a Blob for the file
            saveAs(blob, 'roulette-save.mp'); // Trigger file download
        }

        // Callback for when the save modal closes, potentially handling a loaded file
        function onSaveModalClose(file?: File) {
            if (file) {
                loadSave(file); // Load state if a file was provided
            }
            showSaveModal.value = false; // Close the save modal
        }

        // Loads game state from a provided save file
        function loadSave(file: File) {
            file.arrayBuffer().then(buffer => {
                const state = decompressState(new Uint8Array(buffer)); // Decompress the state
                playing.value = state.playing;
                Object.assign(selectedLists, state.selectedLists); // Restore selected lists
                clearArray(demons);
                demons.push(...state.demons); // Restore demons array
                currentDemon.value = state.current;
                currentPercent.value = state.percent;
                clearArray(percents);
                percents.push(...state.percents); // Restore percents history
                showRemaining.value = false; // Hide remaining demons section after load
            }).catch(error => {
                console.error("Failed to load save file:", error);
                alert("Failed to load save file. It might be corrupted or an old format.");
            });
        }

        // --- Computed Properties ---
        // Returns the subset of demons currently being displayed (up to the current active demon)
        const currentDemons = computed(() => {
            return demons.slice(0, currentDemon.value + 1);
        });

        // Determines if the results section should be shown
        const showResults = computed(() => {
            return !playing.value && demons.length > 0;
        });

        // Calculates and returns the demons that remain after the current challenge has ended
        const remainingDemons = computed(() => {
            // Filters out demons that would exceed 100% in rank
            return demons
                .slice(currentDemon.value + 1)
                .filter((_, i) => currentPercent.value + i + 1 <= 100);
        });

        // --- Return properties and methods to the template ---
        // All reactive variables, computed properties, and functions used in the <template> must be returned here.
        return {
            // State variables
            demons,
            selectedLists,
            playing,
            fetching,
            currentDemon,
            currentPercent,
            percents,
            showRemaining,
            showGiveUpModal,
            showSaveModal,
            showAboutModal,
            darkMode,
            useOldList,
            excludeRouletteDemons, // Make sure this is returned for the checkbox

            // Computed properties
            currentDemons,
            showResults,
            remainingDemons,

            // Methods
            start,
            demonDone,
            giveUp,
            save,
            onSaveModalClose,
        };
    },
});
</script>