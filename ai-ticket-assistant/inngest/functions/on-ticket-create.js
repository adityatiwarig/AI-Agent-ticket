import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created" },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      console.log("🔥 Function triggered");

      const { ticketId } = event.data;

      // 1️⃣ Fetch Ticket
      const ticket = await step.run("fetch-ticket", async () => {
        const found = await Ticket.findById(ticketId);
        if (!found) throw new NonRetriableError("Ticket not found");
        return found;
      });

      // 2️⃣ AI Call (Outside step.run)
      const aiResponse = await analyzeTicket(ticket);
      console.log("AI RESPONSE:", aiResponse);

      // 3️⃣ Update Ticket
      const relatedSkills = await step.run("update-ticket", async () => {
        const skills =
          aiResponse && Array.isArray(aiResponse.relatedSkills)
            ? aiResponse.relatedSkills.map((s) => s.toLowerCase())
            : [];

        await Ticket.findByIdAndUpdate(ticket._id, {
          status: "IN_PROGRESS",
          priority: aiResponse?.priority || "medium",
          helpfulNotes:
            aiResponse?.helpfulNotes || "AI analysis not available.",
          relatedSkills: skills,
        });

        return skills;
      });

      // 4️⃣ Assign Moderator (Improved Logic)
      const moderator = await step.run("assign-moderator", async () => {
        console.log("🔎 Searching for skills:", relatedSkills);

        let user = null;

        if (relatedSkills.length > 0) {
          user = await User.findOne({
            role: "moderator",
            $expr: {
              $gt: [
                {
                  $size: {
                    $setIntersection: [
                      {
                        $map: {
                          input: "$skills",
                          as: "s",
                          in: { $toLower: "$$s" },
                        },
                      },
                      relatedSkills,
                    ],
                  },
                },
                0,
              ],
            },
          });
        }

        // If no skill match → assign any moderator
        if (!user) {
          user = await User.findOne({ role: "moderator" });
        }

        // If still no moderator → fallback admin
        if (!user) {
          user = await User.findOne({ role: "admin" });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        console.log("✅ Assigned To:", user?.email);

        return user;
      });

      // 5️⃣ Send Email
      await step.run("send-email", async () => {
        if (moderator?.email) {
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `New ticket assigned: ${ticket.title}`
          );
        }
      });

      return { success: true };
    } catch (err) {
      console.error("❌ Function error:", err);
      return { success: false };
    }
  }
);
