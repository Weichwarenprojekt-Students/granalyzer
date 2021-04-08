<template>
    <!-- Searchbar -->
    <label class="searchbar">
        <input v-model="filter.userInput" type="text" @keyup.="handleFilter" placeholder="Search..." />
        <svg @click="showFilter = !showFilter">
            <use :xlink:href="require('@/assets/img/icons.svg') + '#filter'"></use>
        </svg>
    </label>

    <!-- Filtering window -->
    <div class="filter" v-if="showFilter">
        <div class="label" v-for="label in labels" :key="label.id">
            <label :for="label.id">
                <input
                    type="checkbox"
                    v-model="filter.labelsToFilterBy"
                    :id="label.id"
                    :value="label.name"
                    checked="checked"
                />
                <span class="checkmark"></span>
                <span class="labelName">{{ label.name }}</span>
            </label>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "OverviewSearch",
    emits: ["user-filter"],
    props: {
        labels: Array,
    },
    data() {
        return {
            // True if filter dialog is shown
            showFilter: false,
            // Filtering data
            filter: {
                // Input in the searchbar
                userInput: "",
                // Labels to filter by
                labelsToFilterBy: [] as Array<string>,
            },
        };
    },
    watch: {
        /**
         * Watch filter property for changes to trigger label filtering
         */
        filter: {
            handler() {
                this.handleFilter();
            },
            deep: true,
        },
    },
    methods: {
        /**
         * Emit the labels and user input to filter by to the overview list
         */
        handleFilter(): void {
            this.$emit("user-filter", { userInput: this.filter.userInput, labels: this.filter.labelsToFilterBy });
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.searchbar {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin-top: 8px;

    svg {
        cursor: pointer;
        fill: @dark;
        width: 24px;
        height: 24px;
        margin-right: 8px;
    }
}

.filter {
    margin-top: 4px;
    border: 1px solid @grey;

    .label {
        margin: 8px 4px;
        display: flex;
        align-items: center;

        label {
            padding: 8px 4px;
            cursor: pointer;
            display: flex;
            width: 100%;
            align-items: center;
        }

        /* Checkbox hover */

        &:hover input ~ .checkmark {
            background-color: @accent_color;
        }

        /* Hide default checkbox */

        input {
            display: none;

            /* Background, when checked */

            &:checked ~ .checkmark {
                background-color: @secondary_color;
            }

            /* Show checkmark, when checked */

            &:checked ~ .checkmark:after {
                display: flex;
            }
        }

        /* Custom checkbox */

        .checkmark {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 20px;
            width: 20px;
            background-color: @light_grey;

            /* Checkmark */

            &:after {
                content: "";
                display: none;
                width: 5px;
                height: 10px;
                border: solid white;
                border-width: 0 2px 2px 0;
                transform: rotate(45deg);
            }
        }

        .labelName {
            font-size: 14px;
            padding-left: 8px;
        }
    }
}
</style>
