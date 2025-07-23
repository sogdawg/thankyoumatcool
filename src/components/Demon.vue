<template>
    <div
        class="flex flex-col items-center p-5 shadow-lg rounded-lg w-full max-w-xl transition-all duration-300 ease-in-out"
        :class="{
            'bg-plain-gray-dark': !active, /* Dark gray background for inactive */
            'bg-plain-gray-light ring-2 ring-blue-500 transform scale-105': active, /* Dark gray for active */
        }"
    >
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {{ demon.position }}. {{ demon.name }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">by {{ demon.creator }}</p>

        <!-- Video Player / Thumbnail - Now click-to-play -->
        <div
            class="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 relative cursor-pointer"
            @click="playVideo"
        >
            <template v-if="demon.video">
                <iframe
                    v-if="showVideo"
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
            <!-- Play button overlay for thumbnail -->
            <div v-if="!showVideo && demon.video" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <svg class="w-16 h-16 text-white opacity-80" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
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
import { defineComponent, ref, watch } from 'vue';
import { SimplifiedDemon } from '../types'; // Adjust path if needed

export default defineComponent({
    props: {
        demon: {
            type: Object as () => SimplifiedDemon,
            required: true,
        },
        active: Boolean, // Indicates if this is the currently active demon in roulette
        currentPercent: Number, // The overall current percent of the roulette (from App.vue)
        percent: Number, // The target percent for *this* specific demon (passed from App.vue)
    },
    emits: ['done', 'give-up'], // Declare emitted events

    setup(props, { emit }) {
        const showVideo = ref(false); // Local state to control video visibility

        // Watch for 'active' prop changes to reset video state when a new demon becomes active
        watch(() => props.active, (newVal) => {
            if (newVal) {
                showVideo.value = false; // Reset to show thumbnail when demon becomes active
            }
        }, { immediate: true }); // Run immediately on component mount

        // Debugging log for video URL
        console.log(`Demon.vue: Processing demon "${props.demon.name}". Video ID/URL received:`, props.demon.video);

        // Regex to check if it's just a YouTube video ID (11 characters, alphanumeric, hyphen, underscore)
        const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;

        // Function to get YouTube embed URL
        function getEmbedUrl(urlOrId: string | null): string {
            if (!urlOrId) return '';
            let videoId = '';

            // Check if it's already just an ID
            if (youtubeIdRegex.test(urlOrId)) {
                videoId = urlOrId;
            } else {
                // Otherwise, try to parse from a full URL
                const videoIdMatch = urlOrId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (videoIdMatch && videoIdMatch[1]) {
                    videoId = videoIdMatch[1];
                }
            }

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            console.warn(`Demon.vue: Could not parse embed URL from: ${urlOrId}`);
            return ''; // Return empty string if not a valid YouTube URL or ID
        }

        // Function to get YouTube thumbnail URL
        function getThumbnailUrl(urlOrId: string | null): string {
            if (!urlOrId) return '';
            let videoId = '';

            // Check if it's already just an ID
            if (youtubeIdRegex.test(urlOrId)) {
                videoId = urlOrId;
            } else {
                // Otherwise, try to parse from a full URL
                const videoIdMatch = urlOrId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (videoIdMatch && videoIdMatch[1]) {
                    videoId = videoIdMatch[1];
                }
            }

            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
            console.warn(`Demon.vue: Could not parse thumbnail URL from: ${urlOrId}`);
            return 'https://placehold.co/480x360/cccccc/333333?text=No+Thumbnail'; // Fallback placeholder
        }

        // Function to handle click on the video/thumbnail area
        function playVideo() {
            if (props.active && props.demon.video) { // Only play if active demon and video exists
                console.log(`Demon.vue: Thumbnail clicked for ${props.demon.name}. Setting showVideo to true.`);
                showVideo.value = true;
            } else if (!props.demon.video) {
                console.warn(`Demon.vue: Clicked on thumbnail area for ${props.demon.name}, but no video URL found.`);
            }
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
            showVideo,
            getEmbedUrl,
            getThumbnailUrl,
            playVideo, // Expose playVideo to template
            handleDoneClick,
            handleGiveUpClick,
        };
    },
});
</script>

<style scoped>
/* Add some basic styling for .demon-card if it's not already in your CSS */
.demon-card {
    border: 1px solid #ccc; /* Consider changing this border color too if desired */
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    width: 80%;
    max-width: 400px;
    margin-bottom: 20px;
}
/* No specific dark mode rule for background here, relying on Tailwind classes */
.dark .demon-card {
    border-color: #555; /* Dark mode border color */
    color: #eee;
}
/* The active class ring is still blue, adjust if you want a different ring color */
</style>
