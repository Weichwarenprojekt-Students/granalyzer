<template>
    <div class="heat-expanded heat-expanded-enum">
        <ul id="enumList">
            <li
                class="heat-row"
                v-for="entry in selectedAttribute.config"
                :key="entry"
                v-text="entry"
                @change="onChange"
            />
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sortable from "sortablejs";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export default defineComponent({
    name: "EnumConfigList",
    props: {
        selectedAttribute: {
            type: Object,
            default: new ApiAttribute(),
        },
    },
    data() {
        return {
            sortable: {} as Sortable
        }
    },
    mounted() {
        const el = document.getElementById("enumList");
        if (el) this.sortable = Sortable.create(el, {

            // When a element is dropped at a new place in the list
            onSort(evt:Event) {
                console.log("Änderung");
            }
        });

    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding-left: 8px;

    background-color: #ccc;
    margin-bottom: 10px;
}

.heat-expanded-enum .heat-row {
    &:first-of-type {
        border-top: 4px red solid;
        padding-top: 4px;
    }

    &:last-of-type {
        border-bottom: 4px green solid;
        padding-bottom: 4px;
    }
}
</style>