import "./styles.css";

import { mountGame } from "../game/gameController";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Missing #app mount node.");
}

mountGame(app).start();
