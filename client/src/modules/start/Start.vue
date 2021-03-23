<template>
    <div id="content">
        <div id="diagram-creation">
            <Creation></Creation>
        </div>
        <div id="diagram">
            <Diagram></Diagram>
        </div>
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

    #diagram-creation {
        height: 440px;
    }
}
</style>
