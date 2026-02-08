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
      HARD GUARD (SAFE)
  ========================= */
  useEffect(() => {
    if (!token || !currentUser) {
      navigate("/");
      return;
    }

    if (currentUser.role !== "admin") {
      navigate("/");
      return;
    }
  }, []); // 👈 EMPTY deps (VERY IMPORTANT)

  /* =========================
      FETCH USERS
  ========================= */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/auth/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        console.log("ADMIN USERS:", data);

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
    setEditingUser(user);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  /* =========================
      SAVE
  ========================= */
  const handleSave = async () => {
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

      // ✅ optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.email === editingUser.email ? data.user : u)),
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
    return <p className="text-center mt-10">Loading users...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      {users.length === 0 && <p className="text-gray-400">No users found</p>}

      {users.map((user) => (
        <div key={user._id} className="border p-4 rounded mb-4">
          <p>
            <b>Email:</b> {user.email}
          </p>
          <p>
            <b>Role:</b> {user.role}
          </p>
          <p>
            <b>Skills:</b> {user.skills?.join(", ") || "N/A"}
          </p>

          {editingUser?._id === user._id ? (
            <div className="mt-3 space-y-2">
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>

              <input
                className="input input-bordered w-full"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />

              <div className="flex gap-2">
                <button className="btn btn-success btn-sm" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm mt-3"
              onClick={() => handleEdit(user)}
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
