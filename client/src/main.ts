import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "@/i18n";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import Dialog from "primevue/dialog";
import Toast from "primevue/toast";
import InputNumber from "primevue/inputnumber";
import ProgressBar from "primevue/progressbar";

// Load the prime vue styles
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// Create the vue app
const app = createApp(App).use(store).use(router).use(i18n);

// Add the prime vue components
app.use(PrimeVue);
app.use(ToastService).component("Toast", Toast);
app.component("Dialog", Dialog);
app.component("InputNumber", InputNumber);
app.component("ProgressBar", ProgressBar);
app.directive("tooltip", Tooltip);

// Mount the app
app.mount("#app");
