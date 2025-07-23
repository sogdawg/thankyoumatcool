<template>
    <div
        class="flex flex-col items-center p-5 shadow-lg rounded-lg w-full max-w-xl transition-all duration-300 ease-in-out"
        :class="{
            'bg-gray-100 dark:bg-gray-800': !active,
            'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 transform scale-105': active,
        }"
    >
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {{ demon.position }}. {{ demon.name }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">by {{ demon.creator }}</p>

        <!-- Video Player / Thumbnail -->
        <div class="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 relative">
            <template v-if="demon.video">
                <iframe
                    v-if="active"
                    class="w-full h-full"
                    :src="getEmbedUrl(demon.video)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                    title="Demon Video"
                ></iframe>
                <img
                    v-else
                    :src="getThumbnailUrl(demon.video)"
                    :alt="`${demon.name} thumbnail`"
                    class="w-full h-full object-cover"
                    onerror="this.onerror=null;this.src='https://placehold.co/480x360/cccccc/333333?text=Video+Unavailable';"
                />
            </template>
            <div v-else class="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No Video Available
            </div>
        </div>

        <p class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-4">
            Target Percent: {{ percent }}%
        </p>

        <div v-if="active" class="flex justify-center gap-4 mt-4">
            <button
                @click="handleDoneClick"
                class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
                Done
            </button>
            <button
                @click="handleGiveUpClick"
                class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
                Give Up
            </button>
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
        currentPercent: Number, // This prop is received but not directly used in template
        percent: Number, // This prop is the target percent for the current demon
    },
    emits: ['done', 'give-up'], // Declare emitted events

    setup(props, { emit }) {
        // Function to get YouTube embed URL
        function getEmbedUrl(url: string | null): string {
            if (!url) return '';
            const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (videoIdMatch && videoIdMatch[1]) {
                return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`;
            }
            return ''; // Return empty string if not a valid YouTube URL
        }

        // Function to get YouTube thumbnail URL
        function getThumbnailUrl(url: string | null): string {
            if (!url) return '';
            const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
            if (videoIdMatch && videoIdMatch[1]) {
                return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
            }
            return 'https://placehold.co/480x360/cccccc/333333?text=No+Thumbnail'; // Fallback placeholder
        }

        function handleDoneClick() {
            console.log(`Demon.vue: 'Done' button clicked for ${props.demon.name}. Emitting 'done' with percent ${props.percent}`);
            emit('done', props.percent);
        }

        function handleGiveUpClick() {
            console.log(`Demon.vue: 'Give Up' button clicked for ${props.demon.name}. Emitting 'give-up'`);
            emit('give-up');
        }

        return {
            getEmbedUrl,
            getThumbnailUrl,
            handleDoneClick,
            handleGiveUpClick,
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
