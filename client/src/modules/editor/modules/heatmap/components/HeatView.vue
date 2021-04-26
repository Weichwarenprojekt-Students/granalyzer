<template>
    <div :class="['heat-view', { 'heat-view-expanded': !collapsed }]">
        <!-- The Header -->
        <div class="heat-header">
            <svg class="heat-collapse-icon" @click="collapsed = !collapsed">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#arrow`"></use>
            </svg>
            <label>{{ label.name }}</label>
            <div class="heat-spacer" />
          <Dropdown
              :options="label.attributes"
              optionsLabel="name"
              :placeholder="$t('global.dropdown.choose')"
              :emptyMessage="$t('global.dropdown.empty')"
          />
        </div>

        <!-- The expandable content -->
        <div class="heat-expanded">
            <div class="heat-row">
                <label>From</label>
                <InputNumber showButtons />
            </div>
            <div class="heat-row">
                <label>To</label>
                <InputNumber showButtons />
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from "vue";
import ApiLabel from "@/models/data-scheme/ApiLabel";

export default defineComponent({
    name: "HeatView",
    components: {
    },
    data() {
        return {
            collapsed: false,
            value: "-",
        };
    },
    props: {
        label: {
          type: Object,
          default: new ApiLabel(),
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-view {
    margin-bottom: 8px;
    margin-top: 8px;
    overflow: hidden;
    transition: height 400ms;
}

.heat-view-expanded {
    .heat-collapse-icon {
        transform: rotate(90deg);
    }

    .heat-expanded {
        display: flex;
    }
}

.heat-header {
    padding-left: 4px;
    padding-right: 16px;
    align-items: center;
    display: flex;
    border-bottom: 1px solid @grey;

    .heat-spacer {
        flex: 1 1 auto;
    }
}

.heat-collapse-icon {
    line-height: inherit;
    cursor: pointer;
    width: 36px;
    height: 36px;
    padding: 12px;
    fill: @dark;
    transition: transform 400ms;
}

.heat-name {
    width: 100px;
    margin-right: 16px;
}

.heat-expanded {
    margin-left: 60px;
    padding: 0 16px 8px 16px;
    display: none;
    border-bottom: 1px solid @grey;
    transition: height 400ms;
    flex-direction: column;
}

.heat-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
}
</style>
