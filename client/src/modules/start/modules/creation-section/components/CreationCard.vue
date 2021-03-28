<template>
    <div id="creation-card">
        <div class="card-icon" @click="$emit('card-click')">
            <img :src="imagePath" :alt="title" />
        </div>
        <h3 class="title">{{ title }}</h3>
        <p>{{ description }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "CreationCard",
    props: {
        imagePath: String,
        title: String,
        description: String,
    },
});
</script>

<style lang="less" scoped>
@import "../../../../../styles/global";

#creation-card {
    margin: 32px 32px 0 0;
    width: 280px;
    min-width: 280px;

    .card-icon {
        height: 180px;
        border: 1px solid black;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        cursor: pointer;

        img {
            height: 100px;
        }

        &:hover {
            background: @accent_color;
        }
    }

    .title {
        font-weight: bold;
        margin-bottom: 8px;
    }
}
</style>
