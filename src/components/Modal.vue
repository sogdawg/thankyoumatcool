<template>
    <div
        v-if="show"
        class="flex flex-col justify-center items-center left-0 top-0 right-0 bottom-0 fixed"
    >
        <div
            @click="close"
            class="absolute left-0 top-0 right-0 bottom-0 bg-black opacity-50 z-10"
        ></div>
        <div class="relative z-20 bg-white dark:bg-plain-gray rounded-lg p-5">
            <!-- Named slot for header -->
            <header v-if="$slots.header">
                <slot name="header"></slot>
            </header>
            <!-- Named slot for body (default content area) -->
            <section class="mt-4" v-if="$slots.body">
                <slot name="body"></slot>
            </section>
            <!-- Named slot for footer -->
            <footer class="mt-4 flex justify-end gap-2" v-if="$slots.footer">
                <slot name="footer"></slot>
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Modal',
    props: {
        show: Boolean,
        cancelable: Boolean,
    },
    emits: ['close'],
    setup(props, ctx) {
        function close() {
            if (props.cancelable) ctx.emit('close');
        }
        return {
            close,
        };
    },
});
</script>
