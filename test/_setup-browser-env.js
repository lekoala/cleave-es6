import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();

CustomEvent = window.CustomEvent;