import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "~/server/db";
import { task_proof } from "~/server/db/schema";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  proofUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .input(
      z.object({ teamId: z.number(), eventId: z.number(), taskId: z.number() }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      console.log("Middleware for imageUploader", input);
      const user = auth();

      // If you throw, the user will not be able to upload
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(task_proof).values({
        teamId: metadata.teamId,
        eventId: metadata.eventId,
        taskId: metadata.taskId,
        url: file.url,
        isImage: file.type === "image",
        uploadedBy: metadata.userId,
      });
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file type", file.type);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
