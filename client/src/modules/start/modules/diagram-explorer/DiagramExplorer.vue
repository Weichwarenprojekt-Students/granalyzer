<template>
    <div id="diagram-content">
        <h2>{{ $t("start.diagrams.title") }}</h2>
        <img class="add-button" src="../../../../assets/img/add-folder.svg" alt="Add Folder" />
    </div>
    <div id="diagram-select">
        <div class="diagram-item">
            <img class="diagram-item-image" src="../../../../assets/img/folder-light.svg" alt="Return" />
            <p class="diagram-item-text diagram-explorer-back">..</p>
        </div>

        <div class="diagram-item" v-for="title in fetchFolders()" :key="title">
            <img class="diagram-item-image" src="@/assets/img/folder.svg" alt="Folder" draggable="false" />
            <p class="diagram-item-text">{{ title }}</p>
        </div>

        <div class="diagram-item" v-for="title in fetchDiagrams()" :key="title">
            <img class="diagram-item-image" src="@/assets/img/diagram.svg" alt="Folder" draggable="false" />
            <p class="diagram-item-text">{{ title }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Diagram",
    data() {
        return {
            mockTitlesFolder: ["Administration", "Develop"],
            mockTitlesDiagrams: ["Diagram_1", "Diagram_2"],
        };
    },
    methods: {
        fetchFolders(): string[] {
            return this.mockTitlesFolder;
        },
        fetchDiagrams(): string[] {
            return this.mockTitlesDiagrams;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../../../global";

#diagram-content {
    display: flex;
    margin-left: 16px;
}

.add-button {
    cursor: pointer;
    margin-left: 16px;
    border-bottom: 2px solid transparent;
    padding: 0 2px 2px 2px;

    &:hover {
        border-bottom: 2px solid #ffa726;
    }
}

#diagram-select {
    display: flex;
    padding-top: 16px;
    flex-wrap: wrap;

    :hover {
        background: @accent_color;
    }

    .diagram-item {
        margin-right: 32px;
        cursor: pointer;
        padding: 16px;

        .diagram-explorer-back {
            color: @dark_grey;
        }

        .diagram-item-image {
            width: 100px;
        }

        .diagram-item-text {
            text-align: center;
            margin-top: 16px;
            max-width: 100px;
        }
    }
}
</style>
