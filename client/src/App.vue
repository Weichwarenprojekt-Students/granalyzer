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

html {
    font-size: 100%;
    box-sizing: border-box;
}

*,
*::before,
*::after {
    box-sizing: inherit;
}

body {
    margin: 0;
    padding: 0;
    line-height: 1;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    color: @font_color;
    height: 100vh;
}
</style>
