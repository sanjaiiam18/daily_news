// pages/all-data.js
"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export default function AllData({ user_id }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = newest first
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/db/mysql/diplay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: user_id }),
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const result = await res.json();
      setData(result.data);
      setFilteredData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? data.filter((item) =>
          [item.title, item.content, item.uploaded_by]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(term))
        )
      : data;
    setFilteredData(filtered);
  };

  // Sort function
  const sortByDate = (items) => {
    return [...items].sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sortOrder === "asc" ? da - db : db - da;
    });
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const displayedData = sortByDate(filteredData);

  return (
    <div className="min-h-screen bg-white text-black container mx-auto px-4 py-8 relative">
      <Head>
        <title>All Database Data</title>
        <meta
          name="description"
          content="View all news data from the database"
        />
      </Head>

      <h1 className="text-3xl font-bold mb-6">News Database</h1>

      <form
        onSubmit={handleSearch}
        className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4"
      >
        <div className="flex flex-grow gap-2 mb-4 md:mb-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, content or author..."
            className="flex-grow p-2 border border-gray-300 rounded text-black"
          />
          <button
            type="submit"
            className="bg-purple-500 text-black px-4 py-2 rounded hover:bg-purple-600 transition"
          >
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setFilteredData(data);
              }}
              className="bg-purple-100 text-black px-4 py-2 rounded hover:bg-purple-200 transition"
            >
              Clear
            </button>
          )}
        </div>
        <div>
          <label className="mr-2 text-black">Sort by:</label>
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="p-2 border border-gray-300 rounded text-black"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </form>

      {loading && <p className="text-center py-4">Loading data...</p>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {displayedData.length === 0 ? (
            <p className="text-center py-8">No news articles found.</p>
          ) : (
            <>
              <p className="mb-4 text-gray-600">
                Showing {displayedData.length} news articles
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedData.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    {item.image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/placeholder-image.jpg")
                          }
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-xl font-semibold mb-2 text-black">
                        {item.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {formatDate(item.date)} • Page {item.Page_no}
                      </p>
                      <p className="text-gray-700 mt-2 text-sm line-clamp-3">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popup Image */}
              {selectedItem.image && (
                <div className="h-64 w-full overflow-hidden">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/placeholder-image.jpg")
                    }
                  />
                </div>
              )}

              <div className="p-6 relative">
                {/* Close Button */}

                <h2 className="text-2xl font-bold mb-4 text-black">
                  {selectedItem.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {formatDate(selectedItem.date)} • Page {selectedItem.Page_no}{" "}
                  • By{" "}
                  <span className="font-medium text-black">
                    {selectedItem.uploaded_by}
                  </span>
                </p>
                <div className="text-gray-700">{selectedItem.content}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
