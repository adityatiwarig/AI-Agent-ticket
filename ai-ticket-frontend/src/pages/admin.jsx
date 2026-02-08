import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function AdminPanel() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    role: "user",
    skills: "",
  });

  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  /* =========================
      HARD GUARD
  ========================= */
  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== "admin") {
      navigate("/");
    }
  }, []);

  /* =========================
      FETCH USERS
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${SERVER_URL}/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  /* =========================
      EDIT
  ========================= */
  const handleEdit = (user) => {
    if (!user) return;

    setEditingUser(user);
    setFormData({
      role: user.role || "user",
      skills: user.skills?.join(", ") || "",
    });
  };

  /* =========================
      SAVE (FIXED)
  ========================= */
  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editingUser?._id) return;

    try {
      const res = await fetch(`${SERVER_URL}/auth/update-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: editingUser.email,
          role: formData.role,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // ✅ SAFE optimistic update (ID based)
      setUsers((prev) =>
  prev.map((u) =>
    u._id === editingUser._id
      ? {
          ...u,                // purana user rakho
          role: formData.role,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }
      : u
  )
);

      setEditingUser(null);
    } catch (err) {
      alert(err.message);
    }
  };

  /* =========================
      UI
  ========================= */
  if (loading) {
    return (
      <p className="text-center mt-20 text-lg text-gray-300 animate-pulse">
        Loading users...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6">
      <div className="max-w-5xl mx-auto bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
          Admin Panel
        </h1>

        {users.length === 0 && (
          <p className="text-gray-400 text-center py-6 text-lg">
            No users found
          </p>
        )}

        <div className="space-y-5">
          {users
            .filter((u) => u && u._id && u.email)
            .map((user) => (
              <div
                key={user._id}
                className="bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-700 transition hover:scale-[1.02]"
              >
                <p>
                  <span className="font-semibold">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {user.role}
                </p>
                <p className="mb-3">
                  <span className="font-semibold">Skills:</span>{" "}
                  {user.skills?.join(", ") || "N/A"}
                </p>

                {editingUser?._id === user._id ? (
                  <form
                    onSubmit={handleSave}
                    className="mt-3 space-y-3"
                  >
                    <select
                      className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>

                    <input
                      className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      value={formData.skills}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skills: e.target.value,
                        })
                      }
                    />

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-xl font-semibold shadow-lg"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="mt-3 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold shadow"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
