<template>
    <div class="heat-expanded heat-expanded-enum">
        <ul id="enumList" ref="config-list">
            <li class="heat-row" v-for="entry in config" :data-value="entry" :key="entry">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#menu`"></use>
                </svg>
                {{ entry }}
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sortable from "sortablejs";
import { EnumConfigElement } from "@/modules/schemes/models/EnumConfigElement";
import { deepCopy } from "@/utility";

export default defineComponent({
    name: "EnumConfigList",
    props: {
        config: {
            type: Array,
            default: [] as Array<EnumConfigElement>,
        },
    },
    data() {
        return {
            sortable: {} as Sortable,
            modifiedConfig: [] as Array<EnumConfigElement>,
        };
    },
    created() {
        this.modifiedConfig = deepCopy(this.config as Array<EnumConfigElement>);
    },
    mounted() {
        const el = document.getElementById("enumList");
        const options = {
            onSort: () => {
                this.onChange();
            },
        };
        if (el) this.sortable = Sortable.create(el, options);
    },
    methods: {
        onChange() {
            let list: EnumConfigElement[] = [];
            (this.$refs["config-list"] as HTMLElement)
                .querySelectorAll("li")
                ?.forEach((el) => list.push(el.dataset["value"] as string));
            this.modifiedConfig = list;

            this.$emit("update:config", this.modifiedConfig);
            this.$emit("change");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-row {
    display: flex;
    padding: 8px 0 10px 8px;
    cursor: n-resize;
    gap: 8px;

    svg {
        height: 16px;
        width: 16px;
        fill: #ccc;
    }
}

#enumList {
    border-top: 4px @heat_from solid;
    border-bottom: 4px @heat_to solid;
    padding-bottom: 4px;
    padding-top: 4px;
}
</style>
