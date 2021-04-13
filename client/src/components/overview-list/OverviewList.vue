<template>
    <div class="content">
        <!-- Title -->
        <div class="title">
            {{ $t("global.titleOverview") }}
            <div v-tooltip="$t('global.filterIcon')">
                <svg @click="showFilter = !showFilter">
                    <use :xlink:href="require('@/assets/img/icons.svg') + '#filter'"></use>
                </svg>
            </div>
        </div>

        <!-- Search bar + Filter -->
        <OverviewSearch
            :labels="labels"
            @user-filter="handleFilter"
            :labelColors="labelColors"
            :showFilter="showFilter"
        ></OverviewSearch>

        <!-- Scrolling content -->
        <ScrollPanel class="scroll-panel">
            <!-- No nodes found -->
            <div v-if="!nodesReady" class="emptyList">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("editor.noNodes.description") }}</div>
            </div>

            <!-- Nodes -->
            <OverviewItem
                v-for="node in nodes"
                :key="node.nodeId"
                :node="node"
                :color="labelColors.get(node.label).color"
                :font-color="labelColors.get(node.label).fontColor"
                :isSelected="node.nodeId === selectedItemId"
                @clicked-on-node="clickedOnNode"
            />
            <div class="space" />
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewItem from "@/components/overview-list/OverviewItem.vue";
import OverviewSearch from "@/components/overview-list/OverviewSearch.vue";
import ApiNode from "@/modules/editor/models/ApiNode";

export default defineComponent({
    name: "OverviewList",
    components: { OverviewItem, OverviewSearch },
    emits: ["extend-nodes", "clicked-on-node", "user-filter"],
    props: {
        // True, if list of nodes has length > 0
        nodesReady: Boolean,
        // Nodes to display
        nodes: Array,
        // Labels for the node visualization
        labels: Array,
        // Colors for the label visualization
        labelColors: Object,
        // True, if scrolling should expand the overview list further
        toggleScrollEmit: Boolean,
        // Id of the item that is selected in the overview
        selectedItemId: String,
    },
    data() {
        return {
            // Scroll panel for the overview
            scrollPanel: {} as Element,
            // Flag to prevent scroll event from loading too many times
            allowReload: true,
            // True if filter is shown
            showFilter: false,
        };
    },
    watch: {
        /**
         * Watch scrolling property to enable reloading after nodes were extended
         */
        toggleScrollEmit() {
            this.allowReload = true;
        },
    },
    mounted() {
        // Watch for scroll events to load new nodes on demand
        this.scrollPanel = document.getElementsByClassName("p-scrollpanel-content")[1];
        this.scrollPanel.addEventListener("scroll", this.handleScroll);
    },
    methods: {
        /**
         * Reload new nodes, when user is scrolling down
         */
        async handleScroll(): Promise<void> {
            const clientHeight = this.scrollPanel.clientHeight;
            const scrollTop = this.scrollPanel.scrollTop;
            const scrollHeight = this.scrollPanel.scrollHeight;

            if (this.allowReload && scrollTop + clientHeight * 1.4 > scrollHeight) {
                this.allowReload = false;
                this.$emit("extend-nodes");
            }
        },
        /**
         * Emit the selected node to the editor/inventory
         */
        clickedOnNode(node: ApiNode) {
            this.$emit("clicked-on-node", node);
        },
        /**
         * Emit the labels and user input to filter by to the editor/inventory
         */
        handleFilter(filter: { userInput: string; labelsToFilterBy: Array<string> }): void {
            this.$emit("user-filter", filter);
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
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid @primary_color;

    height: 64px;

    div {
        cursor: pointer;
        width: 24px;
        height: 24px;
        margin-right: 8px;

        svg {
            fill: @dark;
            width: 100%;
            height: 100%;
        }
    }
}

.scroll-panel {
    margin-top: 0 !important;
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
