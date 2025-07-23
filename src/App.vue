<template>
    <main :class="{ dark: darkMode }">
        <div class="w-screen h-screen fixed -z-10 dark:bg-plain-gray"></div>
        <div class="flex justify-center">
            <!-- Main Content Container: Centered, max-width, with padding -->
            <div class="flex flex-col w-full max-w-screen-xl px-4 mx-auto pb-20"> <!-- Added pb-20 for bottom padding -->
                <!-- Title Section -->
                <h1
                    class="mt-5 text-3xl font-medium text-center text-gray-800 dark:text-gray-200 cursor-help border-b-2 border-dashed border-gray-600 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-300 py-2"
                    @click="openAboutModal"
                >
                    Extreme Demon Roulette
                    <p v-if="useOldList" class="text-xl mt-1">2017 List</p>
                </h1>

                <!-- Checkbox and Buttons Section -->
                <div class="flex flex-col md:flex-row mt-5 justify-between items-center w-full gap-4 md:gap-0">
                    <div class="flex flex-col text-gray-800 dark:text-gray-300 items-start">
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
                    <div class="flex mt-4 md:mt-0"> <!-- Added margin-top for small screens -->
                        <button
                            @click="showSaveModal = true"
                            class="rounded px-4 py-2 bg-white text-black border border-gray-300 hover:bg-gray-100 mr-2"
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

                <!-- Demon Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-10">
                    <demon
                        v-for="(demon, i) in currentDemons"
                        :key="i"
                        :demon="demon"
                        :active="playing && i === currentDemon"
                        :currentPercent="currentPercent"
                        :percent="i === currentDemon ? currentPercent : percents[i]"
                        @done="demonDone"
                        @give-up="openGiveUpModal"
                    />
                </div>

                <!-- Results Section (Now includes remaining levels in a grid, no longer a modal for remaining levels) -->
                <article
                    v-if="showResults"
                    class="flex flex-col items-center mt-10 p-5 shadow-lg w-full bg-plain-gray-dark rounded-lg"
                >
                    <h2 class="text-3xl font-medium text-gray-800 dark:text-gray-200 mb-4">Results</h2>
                    <section class="text-xl text-center dark:text-gray-200 mb-6">
                        <p>Number of demons: {{ percents.length }}</p>
                        <p>Highest percent: {{ currentPercent - 1 }}%</p>
                    </section>

                    <template v-if="remainingDemons.length > 0">
                        <h3 class="text-2xl font-medium text-gray-800 dark:text-gray-200 mb-4">Remaining Demons</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                            <demon
                                v-for="(demon, i) in remainingDemons"
                                :key="`remaining-${i}`"
                                :demon="demon"
                                :active="false"
                                :currentPercent="0"
                                :percent="currentPercent + percents.length + i"
                            ></demon> <!-- CHANGED: Explicitly closed tag -->
                        </div>
                    </template>
                    <p v-else-if="currentPercent >= 100" class="text-xl text-center dark:text-gray-200">
                        Congratulations! You finished all levels!
                    </p>
                </article>

                <!-- Modals (Remaining unchanged, removed the 'showRemaining' modal) -->
                <teleport to="body">
                    <Modal v-if="showAboutModal" :show="showAboutModal" @close="closeAboutModal">
                        <template v-slot:header>
                            <h3>About the Extreme Demon Roulette</h3>
                        </template>
                        <template v-slot:body>
                            <p class="mb-2">
                                This is the updated About section! The Extreme Demon Roulette is a challenge where you must go through as many
                                demons as possible, with the challenge ending when you get 100% or give up.
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
                                @click="closeAboutModal"
                            >
                                Close
                            </button>
                        </template>
                    </Modal>
                </teleport>

                <teleport to="body">
                    <GiveUpModal v-if="showGiveUpModal" :show="showGiveUpModal" @confirm="confirmGiveUp" @close="closeGiveUpModal" />
                </teleport>

                <teleport to="body">
                    <SaveModal v-if="showSaveModal" :show="showSaveModal" @close="onSaveModalClose" />
                </teleport>
                <!-- Removed the 'showRemaining' modal section as it's now integrated directly -->

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
import { defineComponent, reactive, ref, computed, onUnmounted, watchEffect, watch, Ref, ComputedRef } from 'vue';
import Demon from './components/Demon.vue';
import Modal from './components/Modal.vue';
import SaveModal from './components/SaveModal.vue';
import GiveUpModal from './components/GiveUpModal.vue';
import { RouletteState, SimplifiedDemon } from './types';
import { shuffle, clearArray } from './utils';
import { unloadHandler } from './unloadHandler';
import { veryOldDemons } from './veryOldList'; // Your custom list
import { simplifyDemon, compressState, decompressState } from './save';
import { saveAs } from 'file-saver';

// Define an interface for the return type of setup()
interface AppSetupReturn {
    demons: SimplifiedDemon[];
    selectedLists: {
        main: boolean;
        extended: boolean;
        legacy: boolean;
    };
    playing: Ref<boolean>;
    fetching: Ref<boolean>;
    currentDemon: Ref<number>;
    currentPercent: Ref<number>;
    percents: number[];
    showRemaining: Ref<boolean>;
    showGiveUpModal: Ref<boolean>;
    showSaveModal: Ref<boolean>;
    showAboutModal: Ref<boolean>;
    darkMode: Ref<boolean>;
    useOldList: ComputedRef<boolean>;
    excludeRouletteDemons: Ref<boolean>;

    currentDemons: ComputedRef<SimplifiedDemon[]>;
    showResults: ComputedRef<boolean>;
    remainingDemons: ComputedRef<SimplifiedDemon[]>;

    start: () => Promise<void>;
    demonDone: (percent: number) => void;
    save: () => void;
    onSaveModalClose: (file?: File) => void;
    openAboutModal: () => void;
    closeAboutModal: () => void;
    openGiveUpModal: () => void;
    closeGiveUpModal: () => void;
    confirmGiveUp: () => void;
}


export default defineComponent({
    components: {
        Demon,
        Modal,
        SaveModal,
        GiveUpModal,
    },
    setup(): AppSetupReturn {
        // --- Reactive State Variables ---
        const selectedLists = reactive({
            main: true,
            extended: true,
            legacy: false,
        });

        let demons = reactive([] as SimplifiedDemon[]);

        const playing = ref(false);
        const fetching = ref(false);

        const useOldList = computed(() => window.location.search.includes('2017'));

        const excludeRouletteDemons = ref(false);

        watch([selectedLists, excludeRouletteDemons], () => {
            console.log("Checkbox states changed:");
            console.log("Main:", selectedLists.main);
            console.log("Extended:", selectedLists.extended);
            console.log("Exclude Roulette:", excludeRouletteDemons.value);
        }, { deep: true });

        const currentDemon = ref(0);
        const currentPercent = ref(1);
        const percents = reactive([] as number[]);

        const showRemaining = ref(false);
        const showGiveUpModal = ref(false);
        const showSaveModal = ref(false);
        const showAboutModal = ref(false);

        const darkMode = ref(localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches));

        // --- Constants ---
        const ONGOING_ROULETTE_EXCLUSIONS = new Set<string>([
            "Ethereal Artifice", "Carnage Mode", "Zodiac", "Glowy", "Audio Expulsion",
            "GridLocked", "WaveBreaker", "The Hell Zone", "Shock Therapy", "Renevant",
            "The Hell Factory", "Novalis", "Spacial Rend", "Niflheim", "Arctic Arena",
            "Ithacropolis", "The Hell World", "The Hell Origin", "Conical Depression",
            "Penultimate Phase", "Bausha Vortex", "Elite Z Rebirth", "Prismatic Haze",
            "Devil Vortex", "Rate Demon", "Delta Interface",
            "Phobos", "Digital Descent", "Down Bass by Spectra", "Asmodeus", "The Hell Dignity", "Ouroboros", "Omega",
            "Lucid Nightmares",
        ]);

        // --- Lifecycle Hooks & Handlers ---
        const stopHandler = unloadHandler(playing);
        onUnmounted(() => {
            stopHandler();
        });

        watchEffect(() => {
            localStorage.setItem('theme', darkMode.value ? 'dark' : 'light');
        });

        // --- Functions ---
        function openAboutModal() {
            showAboutModal.value = true;
        }

        function closeAboutModal() {
            showAboutModal.value = false;
        }

        function openGiveUpModal() {
            showGiveUpModal.value = true;
        }

        function closeGiveUpModal() {
            showGiveUpModal.value = false;
        }

        function confirmGiveUp() {
            closeGiveUpModal();
            playing.value = false;
        }

        async function start() {
            if (fetching.value) return;
            if (!useOldList.value && !(selectedLists.main || selectedLists.extended)) {
                console.warn("Please select at least one list type (Main or Extended) to start the roulette.");
                return;
            }

            playing.value = true;
            fetching.value = true;
            showRemaining.value = false; // Reset this on start

            clearArray(demons);

            let demonsToProcess: SimplifiedDemon[] = [...veryOldDemons];

            if (!useOldList.value) {
                demonsToProcess = demonsToProcess.filter(demon => {
                    const isMainListRange = demon.position >= 1 && demon.position <= 75;
                    const isExtendedListRange = demon.position >= 76 && demon.position <= 150;

                    let includeDemon = false;
                    if (selectedLists.main && isMainListRange) {
                        includeDemon = true;
                    }
                    if (selectedLists.extended && isExtendedListRange) {
                        includeDemon = true;
                    }

                    return includeDemon;
                });
            }

            const positionsToExclude: Set<number> = new Set([]);
            const namesToExclude: Set<string> = new Set([]);

            const finalFilteredDemons = demonsToProcess.filter((demon: SimplifiedDemon) => {
                if (positionsToExclude.has(demon.position)) {
                    return false;
                }
                if (namesToExclude.has(demon.name)) {
                    return false;
                }
                if (demon.video === null || demon.creator === "" || demon.link === "") {
                     return false;
                }
                if (excludeRouletteDemons.value && ONGOING_ROULETTE_EXCLUSIONS.has(demon.name)) {
                    return false;
                }
                return true;
            });

            demons.push(...finalFilteredDemons);

            if (demons.length === 0) {
                console.warn("No demons loaded after applying all filters. Please adjust your selections.");
                playing.value = false;
                fetching.value = false;
                return;
            }

            fetching.value = false;
            shuffle(demons);
            currentDemon.value = 0;
            currentPercent.value = 1;
            clearArray(percents);
        }

        function demonDone(percent: number) {
            if (isNaN(percent) || percent < currentPercent.value) {
                console.warn(`Invalid percent received: ${percent}. Must be a number and greater than or equal to ${currentPercent.value}`);
                return;
            }
            if (percent >= 100) {
                percent = 100;
                playing.value = false;
            } else if (currentDemon.value >= demons.length - 1) {
                playing.value = false;
            } else {
                currentDemon.value++;
            }
            currentPercent.value = percent + 1;
            percents.push(percent);
        }

        function save() {
            const state: RouletteState = {
                playing: playing.value,
                selectedLists,
                demons: demons,
                current: currentDemon.value,
                percent: currentPercent.value,
                percents: percents,
            };
            const data = compressState(state);
            const blob = new Blob([data], { type: 'application/msgpack' });
            saveAs(blob, 'roulette-save.mp');
        }

        function onSaveModalClose(file?: File) {
            if (file) {
                loadSave(file);
            }
            showSaveModal.value = false;
        }

        function loadSave(file: File) {
            file.arrayBuffer().then(buffer => {
                const state = decompressState(new Uint8Array(buffer));
                playing.value = state.playing;
                Object.assign(selectedLists, state.selectedLists);
                clearArray(demons);
                demons.push(...state.demons);
                currentDemon.value = state.current;
                currentPercent.value = state.percent;
                clearArray(percents);
                percents.push(...state.percents);
                showRemaining.value = false;
            }).catch(error => {
                console.error("Failed to load save file:", error);
                alert("Failed to load save file. It might be corrupted or an old format.");
            });
        }

        // --- Computed Properties ---
        const currentDemons = computed(() => {
            return demons.slice(0, currentDemon.value + 1);
        });

        const showResults = computed(() => {
            return !playing.value && percents.length > 0;
        });

        const remainingDemons = computed(() => {
            if (currentPercent.value >= 100) return [];
            // Calculate the starting percent for the first remaining demon
            const startPercentForRemaining = currentPercent.value;
            return demons
                .slice(currentDemon.value + 1)
                .map((demon, index) => ({
                    ...demon,
                    // Assign the sequential percentage
                    percent: startPercentForRemaining + index
                }))
                .filter(demon => demon.percent <= 100); // Only show up to 100%
        });

        // --- Return properties and methods to the template ---
        return {
            demons, selectedLists, playing, fetching, currentDemon, currentPercent, percents,
            showRemaining, showGiveUpModal, showSaveModal, showAboutModal, darkMode,
            useOldList, excludeRouletteDemons,
            currentDemons, showResults, remainingDemons,
            start, demonDone, save, onSaveModalClose,
            openAboutModal, closeAboutModal, openGiveUpModal, closeGiveUpModal, confirmGiveUp,
        };
    },
});
</script>
