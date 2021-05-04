<template>
    <div class="granalyzer">
        <Sidebar class="sidebar" />
        <router-view class="main-content" />
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

.granalyzer {
    display: flex;
}

.sidebar {
    flex: 0 0 auto;
}

.main-content {
    height: 100vh;
    transition: margin @navbar_animation_time;
    flex: 1 1 auto;
}
</style>
