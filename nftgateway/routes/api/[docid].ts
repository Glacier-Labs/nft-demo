import { HandlerContext, RouteConfig } from "$fresh/server.ts";
import { decodeBase64 } from "https://deno.land/std@0.215.0/encoding/base64.ts";
import { load } from "https://deno.land/std@0.216.0/dotenv/mod.ts";

const env = await load();
const GlacierEndpoint = env["GLACIER_ENDPOINT"];

export const handler = async (
  _req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const docid = _ctx.params.docid;
  const url = `${GlacierEndpoint}/data/v1/action/doc?docid=${docid}`;
  const resp = await fetch(url);
  if (resp.status === 404) {
    return _ctx.renderNotFound();
  }

  const res = await resp.json();

  const documents = res["documents"];
  if (documents.length === 0) {
    return _ctx.renderNotFound();
  }

  const doc = documents[0];

  if (_ctx.params.action === "image") {
    return image(doc, _ctx);
  }

  if (_ctx.params.action === "meta") {
    return meta(_req.url, doc, _ctx);
  }

  return new Response(JSON.stringify(doc), {
    headers: { "content-type": "application/json" },
  });
};

async function image(doc: any, _ctx: HandlerContext): Promise<Response> {
  const field = _ctx.params.field;
  const b64image = doc[field];
  if (
    !b64image ||
    (!b64image.startsWith("data:image/png;base64,") &&
      !b64image.startsWith("data:image/jpg;base64,") && !b64image.startsWith("data:image/jpeg;base64,"))
  ) {
    return _ctx.renderNotFound();
  }

  const items = b64image.split(";base64,");
  const contentType = items[0].replace("data:", "");

  return new Response(decodeBase64(items[1]), {
    headers: { "content-type": contentType },
  });
}

async function meta(
  url: string,
  doc: any,
  _ctx: HandlerContext,
): Promise<Response> {
  for (const key in doc) {
    const b64image = doc[key];
    if (
      b64image.startsWith("data:image/png;base64,") ||
      b64image.startsWith("data:image/jpg;base64,") ||
      b64image.startsWith("data:image/jpeg;base64,")
    ) {
      // redirect to image url
      doc[key] = getImageUrl(url, key);
    }
  }

  return new Response(JSON.stringify(doc), {
    headers: { "content-type": "application/json" },
  });
}

function getImageUrl(url: string, field: string): string {
  return url.replace('/meta', `/image/${field}`);
}

export const config: RouteConfig = {
  routeOverride: "/api/:docid/:action(\\w+)?/:field(\\w+)?",
};
