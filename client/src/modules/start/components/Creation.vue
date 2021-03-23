<template>
    <div id="wrapper">
        <header>
            <h1>New Graph</h1>
        </header>
        <div class="cards">
            <CreationCard description="Create Empty" :imagePath="require('@/assets/img/plus.svg')"></CreationCard>
            <CreationCard description="Create From Node" :imagePath="require('@/assets/img/editor.svg')"></CreationCard>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreationCard from "./CreationCard.vue";

export default defineComponent({
    name: "Creation",
    components: {
        CreationCard,
    },
});
</script>

<style lang="less" scoped>
#wrapper {
    height: 440px;

    header {
        height: 88px;

        h1 {
            margin-top: 0;
            padding: 40px 0 0 40px;
        }
    }

    .cards {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        height: 352px;
    }
}
</style>
