import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { createServerSupabase } from "@/lib/supabase/server";

const f = createUploadthing();

export const ourFileRouter = {
  jobImageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 4,
    },
  })
    .middleware(async () => {
      const supabase = await createServerSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new UploadThingError("No autorizado");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
