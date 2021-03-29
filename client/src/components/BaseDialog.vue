<template>
    <div v-show="show" class="background" @click="$emit('cancel')">
        <Dialog :visible="show">
            <!-- Insert customized content -->
            <slot></slot>

            <!-- The bottom action bar -->
            <div class="bottom-section">
                <button @click="$emit('cancel')" class="btn btn-normal">{{ $t("global.dialog.cancel") }}</button>
                <button @click="$emit('confirm')" class="confirm-button btn btn-primary">
                    {{ $t("global.dialog.confirm") }}
                </button>
            </div>
        </Dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "BaseDialog",
    props: {
        // True if the dialog should be shown
        show: Boolean,
    },
    mounted() {
        window.addEventListener("keyup", this.onKeyUp);
    },
    unmounted() {
        window.removeEventListener("keyup", this.onKeyUp);
    },
    methods: {
        /**
         * Handle the key events (for shortcuts)
         */
        onKeyUp(e: KeyboardEvent) {
            if (this.show) {
                if (e.key == "Escape") this.$emit("cancel");
                else if (e.key == "Enter") this.$emit("confirm");
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "../styles/global";

.background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.bottom-section {
    padding: 8px 24px;
    background: @light_grey;
    display: flex;
    justify-content: flex-end;

    button {
        margin: 8px;
    }
}
</style>
