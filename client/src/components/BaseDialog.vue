<template>
    <div v-show="show" id="background" @click="$emit('cancel')">
        <Dialog :visible="show">
            <slot></slot>
            <div id="bottom-section">
                <button @click="$emit('cancel')" class="btn btn-normal">{{ $t("global.dialog.cancel") }}</button>
                <button @click="$emit('confirm')" class="btn btn-primary">{{ $t("global.dialog.confirm") }}</button>
            </div>
        </Dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "BaseDialog",
    props: {
        show: Boolean,
    },
});
</script>

<style lang="less" scoped>
@import "../styles/global";

#background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
}

#bottom-section {
    padding: 8px 24px;
    background: @light_grey;
    display: flex;
    justify-content: flex-end;

    button {
        margin: 8px;
    }
}
</style>
