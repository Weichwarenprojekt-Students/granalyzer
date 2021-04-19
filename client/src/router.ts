import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Start from "./modules/start/Start.vue";
import Editor from "./modules/editor/Editor.vue";
import Inventory from "./modules/inventory/Inventory.vue";
import { routeNames } from "./utility";
import SchemeEditor from "@/modules/schemes/Schemes.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/:catchAll(.*)",
        redirect: `${routeNames.start}`,
    },
    {
        path: `${routeNames.start}/:id?`,
        name: "Start",
        component: Start,
    },
    {
        path: `${routeNames.editor}`,
        name: "Editor",
        component: Editor,
    },
    {
        path: `${routeNames.inventory}`,
        name: "Inventory",
        component: Inventory,
    },
    {
        path: `${routeNames.schemes}`,
        name: "Scheme Editor",
        component: SchemeEditor,
    },
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes,
});

export default router;
