import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchTicket();
    }
  }, [id, token]);

  if (loading)
    return (
      <div className="text-center mt-20 text-gray-300 animate-pulse text-lg">
        Loading ticket details...
      </div>
    );

  if (!ticket)
    return (
      <div className="text-center mt-20 text-gray-300 text-lg">
        Ticket not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6">
      <div className="max-w-3xl mx-auto bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-white">
        <h2 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Ticket Details
        </h2>

        <div className="bg-gray-800 shadow-xl p-6 rounded-2xl space-y-4">
          <h3 className="text-2xl font-semibold">{ticket.title}</h3>
          <p className="text-gray-300">{ticket.description}</p>

          <div className="border-t border-gray-700 pt-4 text-gray-400 font-semibold">
            Metadata
          </div>

          <p>
            <strong>Status:</strong> {ticket.status}
          </p>

          {ticket.priority && (
            <p>
              <strong>Priority:</strong> {ticket.priority}
            </p>
          )}

          {ticket.relatedSkills?.length > 0 && (
            <p>
              <strong>Related Skills:</strong>{" "}
              {ticket.relatedSkills.join(", ")}
            </p>
          )}

          {ticket.helpfulNotes && (
            <div>
              <strong>Helpful Notes:</strong>
              <div className="prose prose-invert max-w-none rounded mt-2 bg-gray-800 p-3 shadow-inner">
                <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
              </div>
            </div>
          )}

          {ticket.assignedTo?.email && (
            <p>
              <strong>Assigned To:</strong> {ticket.assignedTo.email}
            </p>
          )}

          {ticket.createdAt && (
            <p className="text-sm text-gray-400 mt-2">
              Created At: {new Date(ticket.createdAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
