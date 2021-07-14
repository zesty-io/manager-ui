import ReactDOM from "react-dom";
import { Preview } from "./Preview";

// interploated by webpack at build time
window.CONFIG = __CONFIG__;

ReactDOM.render(<Preview />, document.getElementById("root"));
