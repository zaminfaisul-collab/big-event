import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer, request as createProxyRequest } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5173);
const backendUrl = new URL(process.env.BACKEND_URL || "http://localhost:8080");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = normalize(decoded).replace(/^[/\\]+/, "");
  const absolutePath = join(root, relativePath);
  return absolutePath.startsWith(root) ? absolutePath : root;
}

function proxyApi(request, response) {
  const targetPath = request.url.replace(/^\/api/, "") || "/";
  const target = new URL(targetPath, backendUrl);

  const headers = { ...request.headers, host: backendUrl.host };
  delete headers["content-length"];

  const proxyRequest = createProxyRequest(
    target,
    {
      method: request.method,
      headers,
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, proxyResponse.headers);
      proxyResponse.pipe(response);
    },
  );

  proxyRequest.on("error", (error) => {
    response.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    response.end(
      JSON.stringify({
        code: 1,
        message: `无法连接后端服务：${error.message}`,
        data: null,
      }),
    );
  });

  request.pipe(proxyRequest);
}

function serveStatic(request, response) {
  const requestedPath = safePath(request.url || "/");
  let filePath = requestedPath;
  const isDirectory =
    existsSync(filePath) && statSync(filePath).isDirectory();
  const shouldUseAppShell =
    request.url === "/" || (!existsSync(filePath) && !extname(requestedPath));

  if (shouldUseAppShell || isDirectory) {
    filePath = join(root, "index.html");
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not Found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-cache",
    "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  if ((request.url || "").startsWith("/api/")) {
    proxyApi(request, response);
    return;
  }
  serveStatic(request, response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Big Event frontend: http://localhost:${port}`);
  console.log(`API proxy target: ${backendUrl.origin}`);
});
