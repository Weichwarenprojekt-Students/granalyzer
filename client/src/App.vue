<template>
    <Sidebar />
    <router-view />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sidebar from "@/components/Sidebar.vue";

export default defineComponent({
    name: "App",
    components: {
        Sidebar,
    },
    created() {
        window.addEventListener("resize", this.windowResized);
    },
    unmounted() {
        window.removeEventListener("resize", this.windowResized);
    },
    methods: {
        windowResized(): void {
            const windowWidth = window.innerWidth;

            if (windowWidth < 1080 && !this.$store.getters.sidebarMinimized) {
                this.$store.dispatch("toggleSidebar");
            } else if (windowWidth >= 1080 && this.$store.getters.sidebarMinimized) {
                this.$store.dispatch("toggleSidebar");
            }
        },
    },
});
</script>

<style lang="less">
@import "./global.less";
</style>
