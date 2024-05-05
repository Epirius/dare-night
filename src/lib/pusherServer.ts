import PusherServer from "pusher";
import { env } from "~/env";
import "server-only";

export const pusherServer = new PusherServer({
  appId: env.NEXT_PUBLIC_PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: env.PUSHER_APP_SECRET,
  cluster: env.PUSHER_APP_CLUSTER,
  useTLS: true,
});
