import { FreshContext } from "$fresh/server.ts";
import { Bad, OK } from "../../../common/http.ts";
import { callbackNFT } from "../../../service/nft.ts";

export const handler = async (
  _req: Request,
  _ctx: FreshContext,
): Promise<Response> => {
  const url = new URL(_req.url);
  const collhash = url.searchParams.get("collhash");
  const txhash = url.searchParams.get("txhash");
  const chain = url.searchParams.get("chain");

  if (!collhash || !txhash || !chain) {
    return Bad("missing params");
  }

  try {
    const res = await callbackNFT(chain, collhash, txhash);
    if (res[0]) {
      return OK({});
    }
    return Bad(res[1] as string);
  } catch (error) {
    return Bad(error.toString())
  }
};
