<template>
    <Sidebar />
    <div :class="['main-content', $store.state.sidebarMinimized ? 'main-content-minimized' : 'main-content-expanded']">
        <router-view />
    </div>
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
});
</script>

<style lang="less">
@import "~@/styles/styles.less";

.main-content {
    height: 100vh;
    transition: margin 400ms;
    overflow: auto;
}

.main-content-expanded {
    margin-left: @navbar_width;
}

.main-content-minimized {
    margin-left: @navbar_width_collapsed;
}
</style>
