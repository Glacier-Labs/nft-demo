import { Handlers, type RouteContext } from "$fresh/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.215.0/encoding/base64.ts";
import { GlacierClient } from "npm:@glacier-network/client"
import { Editor } from "../../islands/Editor.tsx"
import { NFTMeta } from "../../islands/NFTMeta.tsx"

const GlacierEndpoint = Deno.env.get("GLACIER_ENDPOINT") || '';
const privateKey = Deno.env.get("GLACIER_PRIVATE_KEY") || '';
const client = new GlacierClient(GlacierEndpoint, { privateKey });
const coll = client.namespace("testapps").dataset("nftgateway").collection("meta")

export const handler: Handlers = {
  async GET(req, ctx) {
    return await ctx.render({
      message: ''
    });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const file = form.get("image") as File;
    const name = form.get("name");
    const description = form.get("description")
    const external_url = form.get("external_url")

    if (!file) {
      return ctx.render({
        message: `Please try again`,
      });
    }

    const b64image = `data:${file.type},${encodeBase64(await file.arrayBuffer())}`
    const doc = {'name': name, 'description': description, 'external_url': external_url, 'image': b64image}
    // let r = await coll.insertOne(doc)

    const docid = '3d358321141f5681696f72f212d4910ef7f28b0eb72424b769304302021b1c8b1'
    const url = `${ctx.url.origin}/api/${docid}/meta`
    const resp = await fetch(url);
    const metaRes = await resp.json();

    return ctx.render({
      message: `${file.name} uploaded! ${name} ${description} ${external_url} ${JSON.stringify(doc)}`,
      docid: docid,
      meta: JSON.stringify(metaRes)
    });
  },
};

export default function Upload(ctx: RouteContext) {
  const { message, docid, meta } = ctx.data;
  console.log("meta:", meta)

  return (
    <>
    {/* // https://tailwindcss.com/docs/flex-basis */}
      <div class="flex flex-row">
        <Editor class="basis-1/2"/>
        <NFTMeta class="basis-1/2" docid={docid} url={ctx.basePath} meta={meta}></NFTMeta>
        {/* <label>{message ? message: ''} </label> */}
      </div>
    </>

  );
}