import { app } from "./app";
const port = Number(process.env.API_PORT ?? 4000);
app.listen(port, "127.0.0.1", () => console.log(`ALUPBESK API berjalan di http://127.0.0.1:${port}`));
