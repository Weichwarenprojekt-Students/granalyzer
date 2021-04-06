<template>
    <div class="content">
        <div class="title">{{ $t("editor.titleOverview") }}</div>
        <label class="searchbar">
            <input type="text" placeholder="Search..." />
        </label>
        <ScrollPanel class="scroll-panel">
            <OverviewItem
                v-for="content in nodes"
                :key="content.id"
                :name="content.name"
                :label="content.label"
                :attribtues="content.attributes"
                :nodeId="content.id"
                :color="labelColor.get(content.label).color"
                :font-color="labelColor.get(content.label).fontColor"
            />
            <div class="space" />
            <div v-if="!nodesAndLabelsLoaded" class="emptyList">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("editor.noNodes.description") }}</div>
            </div>
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
            // Scroll panel y-bar
            scrollPanelBar: {} as Element,
            // Flag to prevent scroll event from loading too many times
            allowReload: true,
        };
    },
    props: {
        // Nodes to be displayed in the overview
        nodes: Array,
        // Background colors and color fonts for the nodes
        labelColor: Object,
    },
    computed: {
        /**
         * Check if list is empty
         */
        nodesAndLabelsLoaded(): boolean {
            return this.$store.state.editor.nodes.length > 0 && this.$store.state.editor.labels.length > 0;
        },
    },
    mounted() {
        this.$store.dispatch("editor/loadNodesAndLabels", false);

        this.scrollPanel = document.getElementsByClassName("p-scrollpanel-content")[0];
        this.scrollPanel.addEventListener("scroll", this.handleScroll);

        this.scrollPanelBar = document.getElementsByClassName("p-scrollpanel-bar-y")[0];
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

                await this.$store.dispatch("editor/loadNodesAndLabels", true);
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
        padding-left: 8px;

        svg {
            fill: @dark_grey;
            height: 24px;
            width: 24px;
        }

        .message {
            color: @dark_grey;
            padding-left: 8px;
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
