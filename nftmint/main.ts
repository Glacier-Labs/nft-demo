/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import config from "./fresh.config.ts";

import connectToDatabase from "./service/datasource.ts";
import { startNFTEventListener } from "./service/nft.ts";

await connectToDatabase()
startNFTEventListener()

await start(manifest, config);
