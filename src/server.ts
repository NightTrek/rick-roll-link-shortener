import { Application, Router, RouterContext, Context, Status } from "oak";
import { exists } from "std/fs/exists.ts";
import { crypto } from "std/crypto/mod.ts";
import { join } from "std/path/join.ts";

// Initialize Deno KV store
const kv = await Deno.openKv();

interface LinkData {
  originalUrl: string;
  shortCode: string;
  title: string | null;
  description: string | null;
  image: string | null;
  createdAt: Date;
}

interface OGTags {
  title: string | null;
  description: string | null;
  image: string | null;
}

// Function to generate a random short code
function generateShortCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(byte => byte % 36)
    .map(n => n.toString(36))
    .join('');
}

// Function to fetch OG tags from a URL
async function fetchOGTags(url: string): Promise<OGTags> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    const getTag = (property: string): string | null => {
      const match = html.match(new RegExp(`<meta\\s+property=["']og:${property}["']\\s+content=["']([^"']+)["']`, 'i'));
      return match ? match[1] : null;
    };

    return {
      title: getTag('title'),
      description: getTag('description'),
      image: getTag('image')
    };
  } catch (error) {
    console.error('Error fetching OG tags:', error);
    return {
      title: null,
      description: null,
      image: null
    };
  }
}

const app = new Application();

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error(error);
    ctx.response.status = error instanceof Error && 'status' in error 
      ? Number(error.status) 
      : Status.InternalServerError;
    ctx.response.body = {
      error: error instanceof Error ? error.message : "Internal Server Error"
    };
  }
});

// Logger middleware
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

const router = new Router();

// Serve static files
app.use(async (context: Context, next) => {
  try {
    await context.send({
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});

// API endpoints
router.post("/api/shorten", async (ctx: RouterContext<"/api/shorten">) => {
  try {
    const body = ctx.request.body();
    if (body.type !== "json") {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "Content-Type must be application/json" };
      return;
    }
    
    const { url } = await body.value;

    if (!url) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "URL is required" };
      return;
    }

    // Generate a unique short code
    let shortCode = generateShortCode();
    let isUnique = false;
    while (!isUnique) {
      shortCode = generateShortCode();
      const existing = await kv.get(["links", shortCode]);
      isUnique = existing.value === null;
    }

    // Fetch OG tags
    const ogTags = await fetchOGTags(url);

    // Save to KV store
    const linkData: LinkData = {
      originalUrl: url,
      shortCode,
      title: ogTags.title,
      description: ogTags.description,
      image: ogTags.image,
      createdAt: new Date()
    };

    await kv.set(["links", shortCode], linkData);

    ctx.response.type = "json";
    ctx.response.body = {
      shortCode,
      originalUrl: url,
      ...ogTags
    };
  } catch (error) {
    console.error('Error processing request:', error);
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: "Internal server error" };
  }
});

router.get("/api/link/:code", async (ctx: RouterContext<"/api/link/:code">) => {
  const { code } = ctx.params;
  if (!code) {
    ctx.response.status = Status.BadRequest;
    ctx.response.body = { error: "Code is required" };
    return;
  }

  try {
    const result = await kv.get<LinkData>(["links", code]);
    
    if (!result.value) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = { error: "Link not found" };
      return;
    }

    const link = result.value;
    ctx.response.type = "json";
    ctx.response.body = {
      originalUrl: link.originalUrl,
      title: link.title,
      description: link.description,
      image: link.image
    };
  } catch (error) {
    console.error('Error fetching link:', error);
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: "Internal server error" };
  }
});

router.get("/:code", async (ctx: RouterContext<"/:code">) => {
  // Always redirect to Rick Roll
  ctx.response.redirect("https://www.youtube.com/watch?v=dQw4w9WgxcQ");
});

app.use(router.routes());
app.use(router.allowedMethods());

const port = 8000;
console.log(`Server running on http://localhost:${port}`);

await app.listen({ port });
