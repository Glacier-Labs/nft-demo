import { FreshContext } from "$fresh/server.ts";
import { OK } from "../../../common/http.ts";
import { contracts } from "../../../service/nft.ts"

export const handler = (_req: Request, _ctx: FreshContext): Response => {
  return OK(contracts());
};
