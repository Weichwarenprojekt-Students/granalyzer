<template>
    <div :class="['sidebar', isStartPage ? '' : 'sidebar-collapsed']">
        <img v-show="isStartPage" class="logo" src="../assets/img/logo.svg" alt="GranalyzerLogo" />
        <img v-show="!isStartPage" class="logo" src="../assets/img/logo-minimized.svg" alt="GranalyzerLogo" />
        <nav>
            <router-link
                v-for="item in items"
                :key="item"
                :to="'/' + item"
                :class="{ isSelected: $route.path === '/' + item }"
            >
                <img class="icon" :src="require('@/assets/img/' + item + '.svg')" :alt="item" />
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

@padding: 16px;
@icon_size: 28px;

.sidebar {
    position: fixed;
    width: @navbar_width;
    height: 100vh;
    background: white;
    transition: width 500ms;
    overflow: hidden;
    border-right: 1px solid @grey;
}

.sidebar-collapsed {
    width: @navbar_width_collapsed;
}

.logo {
    display: block;
    margin: 32px (@padding - 4px);
    height: @icon_size + 8px;
}

.icon {
    margin: @padding;
    height: @icon_size;
}

nav {
    a {
        display: flex;
        text-decoration: none;
        width: 100%;
        p {
            font-size: @h3;
            margin: @padding @padding @padding 0;
            line-height: @icon_size;
        }
    }

    a:hover {
        background: @accent_color;
    }

    .isSelected {
        background: @secondary_color;
    }
}
</style>
