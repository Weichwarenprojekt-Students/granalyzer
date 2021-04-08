<template>
    <div :class="['sidebar', sidebarMinimized ? 'sidebar-collapsed' : '']">
        <!-- The different logo types -->
        <div class="logo">
            <img v-show="!sidebarMinimized" src="~@/assets/img/logo.svg" alt="GranalyzerLogo" />
            <img v-show="sidebarMinimized" src="~@/assets/img/logo-minimized.svg" alt="GranalyzerLogo" />
        </div>

        <!-- The links -->
        <nav>
            <router-link
                v-for="item in items"
                :key="item"
                :to="routes[item]"
                :class="{ isSelected: $route.path.startsWith(routes[item]) }"
                v-tooltip="sidebarMinimized ? $t('global.' + item) : ''"
            >
                <svg class="icon">
                    <use :xlink:href="require('@/assets/img/icons.svg') + '#' + item"></use>
                </svg>
                <p v-show="!sidebarMinimized">{{ $t("global." + item) }}</p>
            </router-link>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { routeNames } from "@/utility";

export default defineComponent({
    name: "Sidebar",
    data() {
        return {
            // The link items
            items: ["start", "editor", "inventory", "schemes"],
        };
    },
    watch: {
        /**
         * Check for route updates (to trigger sidebar updates)
         */
        $route() {
            this.updateSidebar();
        },
    },
    created() {
        // Add the resize listener
        window.addEventListener("resize", this.updateSidebar);
        this.updateSidebar();
    },
    unmounted() {
        // Remove the resize listener
        window.removeEventListener("resize", this.updateSidebar);
    },
    computed: {
        /**
         * Forward the route names of the utility class
         */
        routes() {
            return routeNames;
        },
        /**
         * Forward the sidebar state
         */
        sidebarMinimized() {
            return this.$store.state.sidebarMinimized;
        },
    },
    methods: {
        /**
         * Update the sidebar state
         */
        updateSidebar(): void {
            const expand = this.$route.path.startsWith(routeNames.start) && window.innerWidth >= 1080;
            this.$store.commit("minimizeSidebar", !expand);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

@padding: 16px;
@icon_size: 28px;

.sidebar {
    position: fixed;
    width: @navbar_width;
    height: 100vh;
    background: white;
    transition: width @navbar_animation_time;
    overflow: hidden;
    border-right: 1px solid @grey;
}

.sidebar-collapsed {
    width: @navbar_width_collapsed;

    .logo {
        margin: 16px (@padding - 4px) 48px (@padding - 4px);
    }
}

.logo {
    transition: @navbar_animation_time;
    display: block;
    margin: 32px (@padding - 4px);

    img {
        height: @icon_size + 8px;
    }
}

.icon {
    width: @icon_size;
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

        &:hover {
            background: @secondary_color;
        }
    }
}
</style>
