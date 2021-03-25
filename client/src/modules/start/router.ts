import { RouteRecordRaw } from "vue-router";
import DiagramExplorer from "@/modules/start/modules/diagram-explorer/DiagramExplorer.vue";

export const startRouter: Array<RouteRecordRaw> = [
    {
        path: "explorer/:id?",
        component: DiagramExplorer,
    },
];
