import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Start from "./modules/start/Start.vue";
import Editor from "./modules/editor/Editor.vue";
import Inventory from "./modules/inventory/Inventory.vue";
import { startRouter } from "./modules/start/router";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/:catchAll(.*)",
        redirect: "/start",
    },
    {
        path: "/start",
        name: "Start",
        component: Start,
        children: startRouter,
    },
    {
        path: "/editor",
        name: "Editor",
        component: Editor,
    },
    {
        path: "/inventory",
        name: "Inventory",
        component: Inventory,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
