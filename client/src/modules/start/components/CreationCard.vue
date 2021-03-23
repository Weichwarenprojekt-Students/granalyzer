<template>
    <div id="creation-card">
        <div class="card-icon">
            <img :src="imagePath" :alt="description" />
        </div>
        <div class="card-title">
            <h3>{{ description }}</h3>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "CreationCard",
    props: {
        imagePath: String,
        description: String,
    },
});
</script>

<style lang="less" scoped>
#creation-card {
    height: 320px;
    margin: 40px 0 0 40px;
    width: 400px;

    .card-icon {
        height: 224px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.2);

        display: flex;
        align-items: center;
        justify-content: center;

        img {
        }
    }

    .card-title {
        height: 96px;
    }
}
</style>
