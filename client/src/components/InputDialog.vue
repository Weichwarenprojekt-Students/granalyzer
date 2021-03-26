<template>
    <BaseDialog :input="true" :show="show" @confirm="$emit('input-confirm', name)">
        <div id="mid-section">
            <img :src="imageSrc" alt="Add" />
            <div class="input-wrap">
                <label for="diagramName">{{ title }}</label>
                <input
                    tabindex="0"
                    class="input-large"
                    v-model="name"
                    type="text"
                    id="diagramName"
                    placeholder="Name"
                />
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";

export default defineComponent({
    name: "InputDialog",
    components: {
        BaseDialog,
    },
    props: {
        title: String,
        show: Boolean,
        imageSrc: String,
    },
    data() {
        return {
            name: "",
        };
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

    div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        label {
            font-size: @h1;
            margin-bottom: 8px;
        }
    }
}
</style>
