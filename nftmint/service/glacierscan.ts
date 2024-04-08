import "$std/dotenv/load.ts";
import { GlacierCollectionDetail } from "./types.ts";
import * as config from "../common/config.ts"

const GLACIER_SCAN_ENDPOINT = config.GLACIER_SCAN_ENDPOINT

export async function collectionDetail(namespace: string, dataset: string, collection: string): Promise<GlacierCollectionDetail> {
    const url = `${GLACIER_SCAN_ENDPOINT}/collection/detail?namespace=${namespace}&dataset=${dataset}&collection=${collection}`;
    const resp = await fetch(url);
    if (resp.status === 404) {
        // deno-lint-ignore no-explicit-any
        return undefined as any
    }
    if (resp.status !== 200) {
        throw new Error(`fetch glacier collection detail failed: ${resp.statusText}`);
    }
  
    const res = await resp.json();
    return res
}