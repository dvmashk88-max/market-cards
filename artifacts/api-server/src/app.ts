import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";
import { getCleanSeoPath, SEO_HTML_PATHS } from "./seoRedirect";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "not_found",
    message: "API endpoint not found",
  });
});

if (process.env.NODE_ENV === "production") {
  const publicDir = path.resolve(import.meta.dirname, "public");
  app.get([...SEO_HTML_PATHS], (req, res) => {
    const cleanPath = getCleanSeoPath(req.path);
    const queryStart = req.originalUrl.indexOf("?");
    const query = queryStart === -1 ? "" : req.originalUrl.slice(queryStart);
    res.redirect(301, `${cleanPath}${query}`);
  });
  app.use(express.static(publicDir, { index: false, extensions: ["html"] }));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

export default app;
