<template>
    <Sidebar />
    <div :class="['main-content', $store.state.sidebarMinimized ? 'main-content-minimized' : 'main-content-expanded']">
        <router-view />
    </div>
    <Toast position="bottom-center" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sidebar from "@/components/Sidebar.vue";
import { setToastService } from "@/utility";

export default defineComponent({
    name: "App",
    components: {
        Sidebar,
    },
    beforeCreate() {
        setToastService(this.$toast);
    },
});
</script>

<style lang="less">
@import "~@/styles/styles.less";

.main-content {
    height: 100vh;
    transition: margin @navbar_animation_time;
    overflow: auto;
}

.main-content-expanded {
    margin-left: @navbar_width;
}

.main-content-minimized {
    margin-left: @navbar_width_collapsed;
}
</style>
