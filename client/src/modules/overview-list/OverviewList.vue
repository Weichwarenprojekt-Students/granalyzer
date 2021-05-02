<template>
    <div class="overview-list">
        <!-- Title -->
        <div class="underlined-title">
            {{ $t("overviewList.title") }}
            <button class="btn btn-secondary btn-icon" v-if="create" @click="newNode">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                </svg>
                Add Node
            </button>
        </div>

        <!-- Search bar + Filter -->
        <Searchbar v-model="filter.nameFilter" @show-filter="showLabelFilter = !showLabelFilter" />
        <OverviewFilter
            v-model="filter.labelFilter"
            :expanded="showLabelFilter"
            :labels="$store.state.overview.labels"
            :labelColors="$store.state.overview.labelColor"
        />

        <!-- Scrolling content -->
        <ScrollPanel class="scroll-panel">
            <!-- No nodes found -->
            <div v-if="!$store.getters['overview/nodesReady']" class="emptyList">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("overviewList.noNodes") }}</div>
            </div>

            <!-- Nodes -->
            <OverviewItem
                v-for="node in $store.state.overview.nodes"
                :key="node.nodeId"
                :node="node"
                :color="$store.state.overview.labelColor.get(node.label).color"
                :font-color="$store.state.overview.labelColor.get(node.label).fontColor"
                :isSelected="node.nodeId === selectedItemId"
                @on-node-clicked="onNodeClicked"
                @on-node-drag="onNodeDrag"
            />
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewItem from "@/modules/overview-list/components/OverviewItem.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import Searchbar from "@/components/Searchbar.vue";
import OverviewFilter from "@/modules/overview-list/components/OverviewFilter.vue";
import { NodeFilter } from "@/modules/overview-list/models/NodeFilter.ts";
import { NodeDrag } from "@/shared/NodeDrag";

export default defineComponent({
    name: "OverviewList",
    components: { OverviewFilter, Searchbar, OverviewItem },
    emits: ["on-node-clicked", "on-node-drag"],
    props: {
        // Id of the item that is selected in the overview
        selectedItemId: String,
        // True if the overview also offers an create button
        create: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // Scroll panel for the overview
            scrollPanel: {} as Element,
            // Flag to prevent scroll event from loading too many times
            allowReload: true,
            // True if filter is shown
            showLabelFilter: false,
            // The filter
            filter: new NodeFilter(),
        };
    },
    watch: {
        /**
         * Watch for name filter changes
         */
        "filter.nameFilter"() {
            this.updateOverview();
        },
        /**
         * Watch for label filter changes
         */
        "filter.labelFilter"() {
            this.updateOverview();
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
                await this.$store.dispatch("overview/extendNodes", this.filter);
                this.allowReload = true;
            }
        },
        /**
         * Emit the selected node to the editor/inventory
         */
        onNodeClicked(node: ApiNode) {
            this.$emit("on-node-clicked", node);
        },
        /**
         *  Emit the dragged node to the editor/inventory
         */
        onNodeDrag(node: NodeDrag) {
            this.$emit("on-node-drag", node);
        },
        /**
         * Filter nodes by labels
         */
        updateOverview(): void {
            this.$store.dispatch("overview/loadLabelsAndNodes", this.filter);
        },
        /**
         * Add a new node
         */
        newNode(): void {
            this.$store.dispatch("inspector/newNode");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.overview-list {
    height: 100%;
    padding: 0 16px;
    width: @side_panel_width;
    display: flex;
    flex-flow: column;
}

.underlined-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 64px;
    padding: 0;
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
