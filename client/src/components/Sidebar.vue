<template>
    <div :class="['sidebar', isStartPage ? '' : 'sidebar-collapsed']">
        <div id="logo">
            <img src="../assets/img/logo.svg" alt="GranalyzerLogo" />
        </div>
        <nav v-for="item in items" :key="item">
            <router-link :to="'/' + item" :class="{ isSelected: $route.path === '/' + item }">
                <img :src="require('@/assets/img/' + item + '.svg')" :alt="item" />
                <p v-show="isStartPage">{{ $t("global." + item) }}</p>
            </router-link>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Sidebar",
    data() {
        return {
            items: ["start", "editor", "inventory"],
        };
    },
    computed: {
        isStartPage(): boolean {
            return this.$route.path === "/start";
        },
    },
});
</script>

<style lang="less" scoped>
@import "../global.less";

.sidebar {
    position: fixed;
    width: @navbar_width;
    height: 100vh;
}

.sidebar-collapsed {
    width: @navbar_width_collapsed;
}

.logo {
    padding: 8px;
    height: 40px;
}

nav {
    a {
        display: flex;
        justify-content: flex-start;

        text-decoration: none;
        font-size: 20px;
        color: #333333;

        width: 100%;

        p {
            line-height: 24px;
        }
    }

    a:hover {
        background: @secondary_color;
    }

    .isSelected {
        background: @primary_color;
    }

    img {
        margin: 0 16px 0 12px;
        padding: 0 16px 0 12px;
    }
}
</style>
