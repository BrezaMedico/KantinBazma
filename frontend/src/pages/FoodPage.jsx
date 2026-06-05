import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export default function FoodPage() {
  const [barcode, setBarcode] = useState("");
  const [foods, setFoods] = useState([]);
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const getFoods = async () => {
    const res = await api.get("/foods");
    setFoods(res.data);
  };

  useEffect(() => {
    getFoods();
  }, []);
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addFood = async (e) => {
    e.preventDefault();

    try {
      await api.post("/foods", {
        name,
        stock,
        price,
        barcode,
      });
      toast.success("Data berhasil ditambahkan");

      getFoods();

      setName("");
      setStock("");
      setPrice("");
      setBarcode("");
    } catch (err) {
      toast.error("Gagal menambahkan data");
    }
  };
  const handleEdit = (food) => {
    setEditId(food.id);

    setName(food.name);
    setStock(food.stock);
    setPrice(food.price);
    setBarcode(food.barcode || "");
  };

  const updateFood = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/foods/${editId}`, {
        name,
        stock,
        price,
        barcode,
      });

      toast.success("Data berhasil diupdate");

      setEditId(null);

      setName("");
      setStock("");
      setPrice("");
      setBarcode("");

      getFoods();
    } catch (error) {
      toast.error("Gagal update data");
    }
  };
  const deleteFood = async (id) => {
    console.log("DELETE DIKLIK");
    console.log(id);

    const confirmDelete = confirm("Yakin ingin menghapus data?");

    if (!confirmDelete) return;

    try {
      console.log("MENGIRIM DELETE...");

      const res = await api.delete(`/foods/${id}`);

      console.log(res.data);

      toast.success("Data berhasil dihapus");

      getFoods();
    } catch (error) {
      console.log("ERROR DELETE:");
      console.log(error);

      toast.error("Gagal menghapus data");
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Daftar Makanan</h1>

          <p className="text-gray-500 mt-1">Kelola data makanan kantin</p>
        </div>

        <div
          className="
      bg-gradient-to-r
      from-blue-500
      to-blue-700
      text-white
      px-6
      py-4
      rounded-2xl
      shadow-lg
      "
        >
          Total Menu: {foods.length}
        </div>
      </div>

      {/* FORM */}
      <div
        className="
    bg-white
    p-6
    rounded-3xl
    shadow-lg
    mb-8
    "
      >
        <h2 className="text-2xl font-bold mb-5">
          {editId ? "Edit Makanan" : "Tambah Makanan"}
        </h2>

        <form
          onSubmit={editId ? updateFood : addFood}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            placeholder="Nama makanan"
            className="
          border
          p-3
          rounded-2xl
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
          "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Stock"
            className="
          border
          p-3
          rounded-2xl
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
          "
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <input
            type="number"
            placeholder="Harga"
            className="
          border
          p-3
          rounded-2xl
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
          "
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <input
            type="text"
            placeholder="Barcode (opsional)"
            className="
  border
  p-3
  rounded-2xl
  "
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />

          <button
            className="
          bg-blue-600
          hover:bg-blue-700
          transition
          text-white
          py-3
          rounded-2xl
          shadow-md
          "
          >
            {editId ? "Update Data" : "Tambah Data"}
          </button>
        </form>
      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Cari makanan..."
          className="
        w-full
        md:w-96
        border
        p-3
        rounded-2xl
        shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div
        className="
    bg-white
    rounded-3xl
    shadow-lg
    overflow-hidden
    "
      >
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-4">Nama</th>

              <th className="text-left p-4">Stock</th>

              <th className="text-left p-4">Harga</th>

              <th className="text-left p-4">Barcode</th>

              <th className="text-left p-4">Aksi</th>

              
            </tr>
          </thead>

          <tbody>
            {filteredFoods.map((food) => (
              <tr
                key={food.id}
                className="
              border-b
              hover:bg-gray-50
              transition
              "
              >
                <td className="p-4 font-medium">{food.name}</td>

                <td className="p-4">{food.stock}</td>

                <td className="p-4">Rp {food.price}</td>

                <td className="p-4"> {food.barcode || "-"}</td>

                <td
                  className="
              p-4
              flex
              gap-2
              "
                >
                  <button
                    type="button"
                    onClick={() => handleEdit(food)}
                    className="
                  bg-yellow-500
                  hover:bg-yellow-600
                  transition
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  "
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteFood(food.id)}
                    className="
                  bg-red-500
                  hover:bg-red-600
                  transition
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  "
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredFoods.length === 0 && (
          <div
            className="
        text-center
        py-10
        text-gray-400
        "
          >
            Data makanan kosong
          </div>
        )}
      </div>
    </div>
  );
}
