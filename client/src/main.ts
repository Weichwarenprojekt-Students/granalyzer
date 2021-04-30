import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "@/i18n";
import PrimeVue from "primevue/config";
import Tooltip from "primevue/tooltip";
import ToastService from "primevue/toastservice";
import Checkbox from "primevue/checkbox";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import ProgressBar from "primevue/progressbar";
import ScrollPanel from "primevue/scrollpanel";
import Toast from "primevue/toast";

// Load the prime vue styles
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

// Create the vue app
const app = createApp(App).use(store).use(router).use(i18n);

// Add the prime vue components
app.use(PrimeVue);
app.use(ToastService).component("Toast", Toast);
app.component("Checkbox", Checkbox);
app.component("Dialog", Dialog);
app.component("Dropdown", Dropdown);
app.component("InputNumber", InputNumber);
app.component("ProgressBar", ProgressBar);
app.component("ScrollPanel", ScrollPanel);
app.directive("tooltip", Tooltip);

// Mount the app
app.mount("#app");
