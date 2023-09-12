import { setupServer } from "./server";
const PORT = 8888;
const server = new setupServer(PORT);
server.init();
server.start();
