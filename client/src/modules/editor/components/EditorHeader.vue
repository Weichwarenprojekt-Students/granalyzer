<template>
    <div class="header">
        <h3>{{ $store.state.editor.diagram?.name }}</h3>
    </div>
</template>

<script>
export default {
    name: "EditorHeader",
};
</script>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
