<template>
    <div class="content">
        <div class="title">{{ $t("editor.titleOverview") }}</div>
        <label class="searchbar">
            <input type="text" placeholder="Search..." />
        </label>
        <ScrollPanel class="scroll-panel">
            <div v-if="!$store.getters['editor/nodesReady']" class="emptyList">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("editor.noNodes.description") }}</div>
            </div>
            <OverviewItem
                v-for="node in $store.state.editor.nodes"
                :key="node.nodeId"
                :node="node"
                :color="$store.state.editor.labelColor.get(node.label).color"
                :font-color="$store.state.editor.labelColor.get(node.label).fontColor"
            />
            <div class="space" />
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewItem from "@/modules/editor/modules/overview-list/components/OverviewItem.vue";

export default defineComponent({
    name: "OverviewList",
    components: { OverviewItem },
    data() {
        return {
            // Scroll panel for the overview
            scrollPanel: {} as Element,
            // Flag to prevent scroll event from loading too many times
            allowReload: true,
        };
    },
    mounted() {
        // Load the labels with the first load of matching nodes
        this.$store.dispatch("editor/loadLabels");

        // Watch for scroll events to load new nodes on demand
        this.scrollPanel = document.getElementsByClassName("p-scrollpanel-content")[0];
        this.scrollPanel.addEventListener("scroll", this.handleScroll);
    },
    methods: {
        /**
         * Reload new nodes, when user is scrolling down
         */
        async handleScroll() {
            const clientHeight = this.scrollPanel.clientHeight;
            const scrollTop = this.scrollPanel.scrollTop;
            const scrollHeight = this.scrollPanel.scrollHeight;

            if (this.allowReload && scrollTop + clientHeight * 1.4 > scrollHeight) {
                this.allowReload = false;
                await this.$store.dispatch("editor/extendNodes", true);
                this.allowReload = true;
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    height: 100%;
    border-right: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
}

.title {
    flex: 0 0 auto;

    font-size: @h2;
    display: flex;
    align-items: center;
    border-bottom: 2px solid @primary_color;

    height: 64px;
}

.searchbar {
    flex: 0 0 auto;
    margin-top: 8px;
}

.scroll-panel {
    margin-top: 8px !important;
    overflow: hidden !important;
    flex: 1 1 auto !important;

    .space {
        padding-bottom: 24px;
    }

    .emptyList {
        display: flex;
        align-items: center;
        margin-right: 18px;
        flex-direction: column;

        svg {
            fill: @dark_grey;
            height: 64px;
            width: 64px;
            margin-top: 32px;
            margin-bottom: 16px;
        }

        .message {
            color: @dark;
            font-size: @h3;
        }
    }
}

.button {
    width: 128px;
    height: 40px;
    font-size: @h3;
    padding-right: 8px;

    position: absolute;
    bottom: 16px;
    right: 16px;

    border: 1px solid @dark;
}
</style>
