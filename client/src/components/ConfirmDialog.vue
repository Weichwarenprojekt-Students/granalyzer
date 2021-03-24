<template>
    <BaseDialog :show="show">
        <div id="mid-section">
            <img src="@/assets/img/warning.svg" alt="Warning" />
            <div>
                <h1 class="title">{{ title }}</h1>
                <h3>{{ description }}</h3>
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";

export default defineComponent({
    name: "ConfirmDialog",
    components: {
        BaseDialog,
    },
    props: {
        show: Boolean,
        title: String,
        description: String,
    },
});
</script>

<style lang="less" scoped>
@import "../styles/global";

#mid-section {
    position: relative;
    padding: 32px;
    border-top: 8px solid @primary_color;
    display: flex;
    align-items: center;
    width: 500px;

    img {
        height: 92px;
        margin-right: 32px;
    }

    .title {
        margin-bottom: 8px;
    }
}
</style>
