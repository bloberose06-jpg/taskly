import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createClient } from "@supabase/supabase-js";

const f = createUploadthing();

export const ourFileRouter = {
  jobImageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 4,
    },
  })
    .middleware(async ({ req }) => {
      const authHeader = req.headers.get("authorization");
      const token = authHeader?.replace("Bearer ", "");

      if (!token) throw new UploadThingError("No autorizado");

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) throw new UploadThingError("No autorizado");

      return { userId: data.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
