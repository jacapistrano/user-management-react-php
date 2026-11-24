
import { useEffect, useState } from "react";

import "./App.css";

const API_URL = "http://127.0.0.1:8000/api/users.php";

function App() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Load users
  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to load users.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response from PHP API.");
        }

        if (active) {
          setUsers(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  // Refresh users after add, edit, or delete
  const fetchUsers = async () => {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Unable to refresh users.");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid API response.");
    }

    setUsers(data);
  };

  // Open add modal
  const openAddModal = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", phone: "" });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    setShowModal(true);
  };

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Save user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    console.log(editingUser);

    try {
      const response = await fetch(API_URL, {
        method: editingUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          ...(editingUser ? { id: editingUser.id } : {}),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to save user.");
      }

      await fetchUsers();

      setShowModal(false);
      setEditingUser(null);
      setForm({ name: "", email: "", phone: "" });
      alert(editingUser ? "User updated successfully!" : "User added successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete user.");
      }

      await fetchUsers();
      alert("User deleted successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  // Search users
  const filteredUsers = users.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="user-page">
      <header className="user-header">
        <div className="user-brand">
          <div className="brand-icon">
          </div>

          <div>
            <h2>User Management</h2>
            <span>Administration Dashboard</span>
          </div>
        </div>

        <div className="admin-profile">
          <div className="avatar">A</div>
          <span>Administrator</span>
        </div>
      </header>

      <main className="user-content">
        <div className="page-heading">
          <div>
            <h1>Users</h1>
            <p>Manage your registered users.</p>
          </div>

          <button className="add-button" onClick={openAddModal}>
            Add New User
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        <section className="user-card">
          <div className="table-toolbar">
            <div>
              <h3>All Users</h3>
              <p>{users.length} registered users</p>
            </div>

            <div className="search-box">
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone || "—"}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="edit-button"
                            onClick={() => openEditModal(user)}
                            title="Edit user"
                          >
                          </button>

                          <button
                            className="delete-button"
                            onClick={() => handleDelete(user.id)}
                            title="Delete user"
                          >
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
                <p>Enter the user information below.</p>
              </div>

              <button
                className="close-button"
                onClick={() => setShowModal(false)}
                type="button"
              >
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                required
              />

              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="save-button">
                  {editingUser ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
