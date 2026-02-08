import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";



export const createTicket = async (req, res) => {
  console.log("REQ.USER 👉", req.user);

  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // ✅ FIX: await added
    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
    });

    // ✅ inngest event fire AFTER successful DB save
    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Error creating ticket", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      // ✅ FIX: await added
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;

    const ticket = await Ticket.findById(req.params.id)
      .populate("assignedTo", ["email", "_id"]);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Optional: normal user only see their own ticket
    if (user.role === "user" && ticket.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

