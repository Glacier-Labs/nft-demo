import { FreshContext } from "$fresh/server.ts";
import { Bad, OK } from "../../../common/http.ts";
import { mintedNFTs } from "../../../service/nft.ts";

export const handler = async (_req: Request, _ctx: FreshContext): Promise<Response> => {
  const url = new URL(_req.url);
  const collector = url.searchParams.get("collector");
  if (!collector) {
    return Bad('missing params');
  }

  const nfts = await mintedNFTs(collector.toLowerCase());
  return OK(nfts);
};
