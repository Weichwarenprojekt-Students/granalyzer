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
});
</script>

<style lang="less">
@import "./global.less";
</style>
