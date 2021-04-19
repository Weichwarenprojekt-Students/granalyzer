<template>
    <div class="content">
        <!-- Title -->
        <div class="title">
            {{ $t("global.titleOverview") }}
            <div v-tooltip="$t('global.filterIcon')">
                <svg @click="showLabelFilter = !showLabelFilter">
                    <use :xlink:href="require('@/assets/img/icons.svg') + '#filter'"></use>
                </svg>
            </div>
        </div>

        <!-- Search bar + Filter -->
        <OverviewFilter
            v-show="showLabelFilter"
            v-model="filter.selectedLabels"
            :labels="$store.state.overview.labels"
            :labelColors="$store.state.overview.labelColor"
        />
        <Searchbar v-model="filter.nameFilter" />

        <!-- Scrolling content -->
        <ScrollPanel class="scroll-panel">
            <!-- No nodes found -->
            <div v-if="!$store.getters['overview/nodesReady']" class="emptyList">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("editor.noNodes.description") }}</div>
            </div>

            <!-- Nodes -->
            <OverviewItem
                v-for="node in $store.state.overview.nodes"
                :key="node.nodeId"
                :node="node"
                :color="$store.state.overview.labelColor.get(node.label).color"
                :font-color="$store.state.overview.labelColor.get(node.label).fontColor"
                :isSelected="node.nodeId === selectedItemId"
                @clicked-on-node="clickedOnNode"
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

export default defineComponent({
    name: "OverviewList",
    components: { OverviewFilter, Searchbar, OverviewItem },
    emits: ["clicked-on-node"],
    props: {
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
            showLabelFilter: false,
            // The filter
            filter: {
                nameFilter: "",
                selectedLabels: new Array<string>(),
            },
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
        "filter.selectedLabels"() {
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
        clickedOnNode(node: ApiNode) {
            this.$emit("clicked-on-node", node);
        },
        /**
         * Filter nodes by labels
         */
        updateOverview(): void {
            this.$store.dispatch("overview/loadLabelsAndNodes", this.filter);
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
