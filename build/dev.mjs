import http from "node:http";
import { promises as fs, watch } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PORT) || 3000;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
};

let building = Promise.resolve();

// Requests wait for the running build, because a build wipes dist/ first
function rebuild() {
  building = building.then(async () => {
    try {
      const { pages, problems } = await build();
      console.log(`[build] ${pages.length} page(s)${problems.length ? `, ${problems.length} problem(s):\n- ${problems.join("\n- ")}` : ""}`);
    } catch (e) {
      console.error(`[build] ${e.message}`);
    }
  });
  return building;
}

await rebuild();

let timer;
for (const dir of ["src", "css", "js", "content", "assets"]) {
  watch(path.join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}

const server = http.createServer(async (req, res) => {
  await building;
  const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(DIST, url);
  if (file !== DIST && !file.startsWith(DIST + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    if ((await fs.stat(file)).isDirectory()) {
      if (!url.endsWith("/")) {
        res.writeHead(301, { Location: `${url}/` }).end();
        return;
      }
      file = path.join(file, "index.html");
    }
    const body = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    console.log(`[404] ${url} (looked for ${path.relative(ROOT, file)})`);
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end(`Not found: ${url}`);
  }
});

server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} is already in use. Stop the other server or run: PORT=3001 npm run dev` : e.message);
  process.exit(1);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Dev server: http://127.0.0.1:${PORT}/`);
  console.log(`Styleguide: http://127.0.0.1:${PORT}/styleguide/`);
});
