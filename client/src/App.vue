<template>
    <Sidebar />
    <router-view />
    <Toast />
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
        this.windowResized();
    },
    unmounted() {
        window.removeEventListener("resize", this.windowResized);
    },
    methods: {
        windowResized(): void {
            this.$store.dispatch("minimizeSidebar", window.innerWidth < 1080);
        },
    },
});
</script>

<style lang="less">
@import "styles/styles.less";
</style>
