<template>
    <div id="content">
        <Creation></Creation>
        <hr />
        <Diagram></Diagram>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Creation from "@/modules/start/components/Creation.vue";
import Diagram from "@/modules/start/components/Diagram.vue";

export default defineComponent({
    name: "Start",
    components: {
        Creation,
        Diagram,
    },
    methods: {
        setLang(lang: string) {
            this.$store.commit("setLocale", { lang, i18n: this.$i18n });
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../global.less";

#content {
    margin-left: @navbar_width;
    height: 100vh;
    padding: 32px 64px;
}
</style>
