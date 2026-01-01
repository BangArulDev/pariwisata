import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    image_url: "",
    rating: 4.5,
    has_ar: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchSpots();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const fetchSpots = async () => {
    try {
      // Fetch from backend API
      const response = await fetch("http://localhost:5000/api/wisata");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSpots(data);
    } catch (error) {
      console.error("Error fetching spots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingSpot
        ? `http://localhost:5000/api/wisata/${editingSpot.id}`
        : "http://localhost:5000/api/wisata";

      const method = editingSpot ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      setShowModal(false);
      setEditingSpot(null);
      setFormData({
        name: "",
        type: "",
        description: "",
        image_url: "",
        rating: 4.5,
        has_ar: false,
      });
      fetchSpots();
    } catch (error) {
      console.error("Error saving spot:", error);
      alert("Failed to save spot");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this spot?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/wisata/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      fetchSpots();
    } catch (error) {
      console.error("Error deleting spot:", error);
      alert("Failed to delete spot");
    }
  };

  const openEditModal = (spot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name,
      type: spot.type,
      description: spot.description,
      image_url: spot.image_url,
      rating: spot.rating,
      has_ar: spot.has_ar,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSpot(null);
    setFormData({
      name: "",
      type: "",
      description: "",
      image_url: "",
      rating: 4.5,
      has_ar: false,
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} /> Add New Spot
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AR
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {spots.map((spot) => (
                <tr key={spot.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={spot.image_url}
                      alt={spot.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {spot.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {spot.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {spot.rating}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {spot.has_ar ? (
                      <span className="text-green-600 font-bold">Yes</span>
                    ) : (
                      "No"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(spot)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(spot.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingSpot ? "Edit Spot" : "Add New Spot"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border rounded-md p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full border rounded-md p-2"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="mt-1 block w-full border rounded-md p-2"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1 block w-full border rounded-md p-2"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    checked={formData.has_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, has_ar: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Has AR?
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
