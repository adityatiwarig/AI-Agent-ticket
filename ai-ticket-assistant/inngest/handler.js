import { serve } from "inngest/express";
import { inngest } from "./client.js";
import { onTicketCreated } from "./functions/on-ticket-create.js";

export const inngestHandler = serve({
  client: inngest,
  functions: [onTicketCreated],
});
