<template>
    <div class="home">
        <HelloWorld :msg="title" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue";

export default defineComponent({
    name: "Home",
    components: {
        HelloWorld,
    },
    data() {
        return {
            title: "",
        };
    },
    async created() {
        this.title = (await (await fetch("api")).json()).title;
    },
});
</script>
