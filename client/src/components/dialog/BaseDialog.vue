<template>
    <Dialog :visible="show">
        <div class="dialog-background" @click="$emit('cancel')">
            <div class="dialog-content">
                <!-- Insert customized content -->
                <slot></slot>

                <!-- The bottom action bar -->
                <div class="dialog-footer">
                    <button @click="$emit('cancel')" class="btn btn-normal">{{ $t("global.dialog.cancel") }}</button>
                    <button @click="$emit('confirm')" class="confirm-button btn btn-primary">
                        {{ $t("global.dialog.confirm") }}
                    </button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "BaseDialog",
    props: {
        // True if the dialog should be shown
        show: Boolean,
        // True if the dialog should enable default keybindings
        bindKeyEvents: {
            type: Boolean,
            default: true,
        },
    },
    mounted() {
        if (this.bindKeyEvents) window.addEventListener("keyup", this.onKeyDown);
    },
    unmounted() {
        if (this.bindKeyEvents) window.removeEventListener("keyup", this.onKeyDown);
    },
    methods: {
        /**
         * Handle the key events (for shortcuts)
         */
        onKeyDown(e: KeyboardEvent) {
            if (this.show) {
                if (e.key == "Escape") this.$emit("cancel");
                else if (e.key == "Enter") this.$emit("confirm");
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.dialog-footer {
    padding: 8px 24px;
    background: @light_grey;
    display: flex;
    justify-content: flex-end;

    button {
        margin: 8px;
    }
}

.dialog-background {
    display: flex;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
}

.dialog-content {
    background: white;
}
</style>
