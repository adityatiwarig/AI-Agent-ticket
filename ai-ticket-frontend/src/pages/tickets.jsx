import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets();
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-800 p-6">
      <div className="max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-white">
        <h2 className="text-4xl font-extrabold mb-8 text-center tracking-wide text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          Create Ticket
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5 mb-12">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ticket Title"
            className="w-full p-5 rounded-2xl border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition shadow-md"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ticket Description"
            className="w-full p-5 rounded-2xl border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition shadow-md resize-none"
            rows={5}
            required
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 active:scale-95 rounded-2xl font-semibold text-lg transition shadow-xl disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        <h2 className="text-3xl font-bold mb-6 text-center tracking-wide text-indigo-300">
          All Tickets
        </h2>
        <div className="space-y-5">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="block p-6 rounded-3xl bg-gray-800 hover:bg-gray-700 transition-transform transform hover:scale-105 shadow-2xl border border-gray-700"
            >
              <h3 className="text-2xl font-bold mb-2 text-white">{ticket.title}</h3>
              <p className="text-gray-300 mb-2">{ticket.description}</p>
              <p className="text-gray-400 text-sm">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
          {tickets.length === 0 && (
            <p className="text-gray-300 text-center py-6 text-lg">
              No tickets submitted yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
