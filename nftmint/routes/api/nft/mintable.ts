import { FreshContext } from "$fresh/server.ts";
import { OK, Bad } from "../../../common/http.ts";
import { mintable } from "../../../service/nft.ts";

export const handler = async (_req: Request, _ctx: FreshContext): Promise<Response> => {
  const url = new URL(_req.url);
  const chain = url.searchParams.get('chain');
  const namespace = url.searchParams.get('namespace');
  const dataset = url.searchParams.get('dataset');
  const collection = url.searchParams.get('collection');
  if (!chain || !namespace || !dataset || !collection) {
    return Bad('missing params');
  }


  const res = await mintable(chain, namespace, dataset, collection)

  return OK(res);
};
