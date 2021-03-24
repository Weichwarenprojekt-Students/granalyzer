<template>
    <div :class="['content', sidebarMinimized ? 'sidebar-collapsed' : '']">
        <CreationSection></CreationSection>
        <hr />
        <Diagram></Diagram>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreationSection from "@/modules/start/components/CreationSection.vue";
import Diagram from "@/modules/start/modules/diagram-explorer/DiagramExplorer.vue";

export default defineComponent({
    name: "Start",
    components: {
        CreationSection,
        Diagram,
    },
    methods: {
        setLang(lang: string) {
            this.$store.commit("setLocale", { lang, i18n: this.$i18n });
        },
    },
    computed: {
        sidebarMinimized(): boolean {
            return this.$store.getters.sidebarMinimized;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../global.less";

.content {
    margin-left: @navbar_width;
    height: 100vh;
    padding: 32px 48px;

    hr {
        margin: 64px 16px;
    }
}

.sidebar-collapsed {
    margin-left: @navbar_width_collapsed;
}
</style>
