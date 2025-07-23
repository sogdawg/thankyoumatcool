<template>
    <div
        class="flex flex-col items-center p-5 shadow-lg rounded-lg w-full transition-all duration-300 ease-in-out"
        :class="{
            'bg-plain-gray-dark': !active, /* Dark gray background for inactive */
            'bg-plain-gray-light ring-2 ring-blue-500 transform scale-105': active, /* Dark gray for active */
        }"
    >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 w-full text-center truncate px-2"> {{ demon.position }}. {{ demon.name }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4 text-center truncate w-full px-2">by {{ demon.creator }}</p> <div
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
import { defineComponent, ref, watch, PropType } from 'vue';
import { SimplifiedDemon } from '../types';

export default defineComponent({
    props: {
        demon: {
            type: Object as PropType<SimplifiedDemon>,
            required: true,
        },
        active: {
            type: Boolean,
            required: true,
        },
        currentPercent: {
            type: Number,
            required: true,
        },
        percent: {
            type: Number,
            required: true,
        },
    },
    emits: ['done', 'give-up'],

    setup(props, { emit }) {
        const showVideo = ref(false);

        watch(() => props.active, (newVal) => {
            if (newVal) {
                showVideo.value = false;
            }
        }, { immediate: true });

        const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;

        function getEmbedUrl(urlOrId: string | null): string {
            if (!urlOrId) return '';
            let videoId = '';

            if (youtubeIdRegex.test(urlOrId)) {
                videoId = urlOrId;
            } else {
                const videoIdMatch = urlOrId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (videoIdMatch && videoIdMatch[1]) {
                    videoId = videoIdMatch[1];
                }
            }

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
            console.warn(`Demon.vue: Could not parse embed URL from: ${urlOrId}`);
            return '';
        }

        function getThumbnailUrl(urlOrId: string | null): string {
            if (!urlOrId) return '';
            let videoId = '';

            if (youtubeIdRegex.test(urlOrId)) {
                videoId = urlOrId;
            } else {
                const videoIdMatch = urlOrId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (videoIdMatch && videoIdMatch[1]) {
                    videoId = videoIdMatch[1];
                }
            }

            if (videoId) {
                return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
            console.warn(`Demon.vue: Could not parse thumbnail URL from: ${urlOrId}`);
            return 'https://placehold.co/480x360/cccccc/333333?text=No+Thumbnail';
        }

        function playVideo() {
            if (props.active && props.demon.video) {
                showVideo.value = true;
            } else if (!props.demon.video) {
                console.warn(`Demon.vue: Clicked on thumbnail area for ${props.demon.name}, but no video URL found.`);
            }
        }

        function handleDoneClick() {
            emit('done', props.percent);
        }

        function handleGiveUpClick() {
            emit('give-up');
        }

        return {
            showVideo,
            getEmbedUrl,
            getThumbnailUrl,
            playVideo,
            handleDoneClick,
            handleGiveUpClick,
        };
    },
});
</script>

<style scoped>
/* No additional scoped styles needed, Tailwind handles it */
</style>
