import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState([]);
  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/images");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form submission for create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (image) formData.append("image", image);

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/images/${editId}`, formData);
        setIsEditing(false);
        setEditId(null);
      } else {
        await axios.post("http://localhost:5000/api/images", formData);
      }
      setImage(null);
      fetchData();
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Handle delete operation
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/images/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  // Handle edit operation
  const handleEdit = (item) => {
    setEditId(item._id);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <main className="mx-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8 w-full max-w-md mx-auto"
        >
          <h2 className="text-xl font-bold mb-4 text-center">
            {isEditing ? "Edit Image" : "Add New Image"}
          </h2>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Choose Image
            </label>
            <input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {isEditing ? "Update" : "Create"}
          </button>
        </form>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-lg shadow-md">
              {item.imageUrl && (
                <img
                  src={`http://localhost:5000/${item.imageUrl}`}
                  alt="Uploaded"
                  className="w-full h-48 object-cover mb-4 rounded"
                />
              )}
              <div className="flex justify-between">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
