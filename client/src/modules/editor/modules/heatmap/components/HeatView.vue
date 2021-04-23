<template>
    <div :class="['heat-view', { 'heat-view-expanded': !collapsed }]">

        <!-- The Header -->
        <div class="heat-header">
            <svg class="heat-collapse-icon" @click="collapsed = !collapsed">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#arrow`"></use>
            </svg>
            <label>{{ name }}</label>
            <div class="heat-spacer" />
        </div>

        <!-- The expandable content -->
        <div class="heat-expanded">
            <div class="heat-row">
                <label>from 0</label>
            </div>
            <div class="heat-row">
                <label>to 10</label>
            </div>
        </div>

    </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent( {
    name: "HeatView",
    data() {
        return {
            collapsed: true,
        }
    },
    props: {
        name: String,
    }
});
</script>

<style lang="less" scoped>
@import "../../../../schemes/styles/schemes";

@attribute_edit_height: 30px;

.heat-view {
    height: @line_height;
    margin-bottom: 8px;
    margin-top: 8px;
    overflow: hidden;
    transition: height 400ms;
    margin-right: 18px;
}

.heat-view-expanded {
    height: @line_height + 3 * @attribute_edit_height;
    .heat-collapse-icon {
        transform: rotate(90deg);
    }
    .heat-expanded {
        height: 3 * @attribute_edit_height;
    }
}

.heat-header {
    padding-left: 4px;
    padding-right: 16px;
    align-items: center;
    height: @line_height;
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
    height: @line_height;
    line-height: @line_height;
    margin-right: 16px;
}

.heat-expanded {
    margin-left: 100px;
    padding: 0 16px;
    height: 0;
    border-bottom: 1px solid @grey;
    transition: height 400ms;
}

.heat-row {
    align-items: center;
    height: @attribute_edit_height;
    display: flex;
    justify-content: space-between;
}

</style>