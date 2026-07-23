import { app } from "./app";
const port = Number(process.env.API_PORT ?? 4000);
app.listen(port, () => console.log(`ALUPBESK API berjalan di http://localhost:${port}`));
