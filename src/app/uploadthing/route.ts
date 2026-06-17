import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Exporta los handlers GET y POST para Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
