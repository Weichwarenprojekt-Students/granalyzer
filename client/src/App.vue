<template>
    <Navigation />
    <router-view />
    <button @click="setLang('de')">DE</button>
    <button @click="setLang('en')">EN</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navigation from "@/components/Navigation.vue";

export default defineComponent({
    name: "App",
    components: {
        Navigation,
    },
    methods: {
        setLang(lang: string) {
            this.$store.commit("setLocale", { lang, i18n: this.$i18n });
        },
    },
});
</script>

<style lang="less">
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

#nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
</style>
