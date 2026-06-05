import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function PurchasePage() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [foods, setFoods] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [buyerName, setBuyerName] = useState("");
  const [foodId, setFoodId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [price, setPrice] = useState(0);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const [showDetail, setShowDetail] = useState(false);

  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const exportToExcel = () => {
    try {
      const excelData = [];

      purchases.forEach((purchase) => {
        if (purchase.items && purchase.items.length > 0) {
          purchase.items.forEach((item) => {
            excelData.push({
              Pembeli: purchase.buyer_name,
              Tanggal: new Date(purchase.created_at).toLocaleDateString(
                "id-ID",
              ),

              Makanan: item.name,
              Qty: item.quantity,
              Harga: item.price_per_pcs,
              Subtotal: item.subtotal,

              Grand_Total: purchase.grand_total,
            });
          });
        } else {
          excelData.push({
            Pembeli: purchase.buyer_name,
            Tanggal: new Date(purchase.created_at).toLocaleDateString("id-ID"),

            Makanan: "-",
            Qty: "-",
            Harga: "-",
            Subtotal: "-",

            Grand_Total: purchase.grand_total,
          });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 25 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pembelian");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const file = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(file, `Laporan_Pembelian_${Date.now()}.xlsx`);

      toast.success("Excel berhasil didownload");
    } catch (error) {
      console.log(error);

      toast.error("Gagal membuat file Excel");
    }
  };

  const grandTotal = cart.reduce((total, item) => total + item.subtotal, 0);

  const handleBarcodeScan = async (e) => {
    if (e.key !== "Enter") return;

    try {
      const res = await api.get(`/foods/barcode/${barcodeInput}`);

      const food = res.data;

      setFoodId(food.id);
      setPrice(food.price);

      toast.success(`${food.name} ditemukan`);

      setBarcodeInput("");
    } catch (error) {
      toast.error("Barcode tidak ditemukan");
    }
  };

  // Ambil daftar makanan
  const getFoods = async () => {
    try {
      const res = await api.get("/foods");
      setFoods(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Ambil data pembelian
  const getPurchases = async () => {
    try {
      const res = await api.get("/purchases");
      setPurchases(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFoods();
    getPurchases();
  }, []);

  // Saat pilih makanan
  const handleFoodChange = (e) => {
    const selectedFoodId = e.target.value;

    setFoodId(selectedFoodId);

    const selectedFood = foods.find((food) => food.id == selectedFoodId);

    if (selectedFood) {
      setPrice(selectedFood.price);
    }
  };

  const addToCart = () => {
    if (!foodId || !quantity) {
      toast.error("Lengkapi data");
      return;
    }

    const selectedFood = foods.find((food) => food.id == foodId);

    // cek stock
    if (Number(quantity) > selectedFood.stock) {
      toast.error("Stock tidak cukup");
      return;
    }

    const subtotal = Number(quantity) * Number(price);

    const existingItem = cart.find((item) => item.food_id == foodId);

    // kalau makanan sudah ada di cart
    if (existingItem) {
      const updatedCart = cart.map((item) => {
        if (item.food_id == foodId) {
          const newQty = item.quantity + Number(quantity);

          if (newQty > selectedFood.stock) {
            toast.error("Melebihi stock");
            return item;
          }

          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.price_per_pcs,
          };
        }

        return item;
      });

      setCart(updatedCart);
    } else {
      const newItem = {
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        quantity: Number(quantity),
        price_per_pcs: Number(price),
        subtotal,
      };

      setCart([...cart, newItem]);
    }

    setFoodId("");
    setQuantity("");
    setPrice(0);

    toast.success("Ditambahkan ke keranjang");
  };

  const removeCartItem = (foodId) => {
    const filtered = cart.filter((item) => item.food_id !== foodId);

    setCart(filtered);
  };

  const openDetail = (purchase) => {
    setSelectedPurchase(purchase);

    setShowDetail(true);
  };

  const deletePurchase = async (id) => {
    const confirmDelete = confirm("Yakin ingin menghapus transaksi?");

    if (!confirmDelete) return;

    try {
      await api.delete(`/purchases/${id}`);

      toast.success("Transaksi berhasil dihapus");

      getPurchases();
      getFoods();
    } catch (error) {
      toast.error("Gagal menghapus transaksi");
    }
  };

  // Tambah pembelian
  const addPurchase = async (e) => {
    e.preventDefault();

    try {
      await api.post("/purchases", {
        buyer_name: buyerName,
        cart,
        grand_total: grandTotal,
      });

      toast.success("Pembelian berhasil ditambahkan");

      setBuyerName("");
      setFoodId("");
      setQuantity("");
      setPrice(0);
      setCart([]);

      getPurchases();
      getFoods();
    } catch (error) {
      toast.error("Gagal menambahkan pembelian");
    }
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">Data Pembelian</h1>

        <button
          type="button"
          onClick={exportToExcel}
          className="
      bg-emerald-600
      hover:bg-emerald-700
      text-white
      px-5
      py-2
      rounded-xl
      transition
      "
        >
          Download Excel
        </button>
      </div>

      <form
        onSubmit={addPurchase}
        className="bg-white p-5 rounded-2xl shadow mb-5"
      >
        <input
          type="text"
          placeholder="Nama Pembeli"
          className="border p-2 w-full mb-3 rounded"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Scan Barcode"
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          onKeyDown={handleBarcodeScan}
          className="border p-2 w-full mb-3 rounded"
        />

        <select
          className="border p-2 w-full mb-3 rounded"
          value={foodId}
          onChange={handleFoodChange}
        >
          <option value="">Pilih Makanan</option>

          {foods.map((food) => (
            <option key={food.id} value={food.id}>
              {food.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Jumlah PCS"
          className="border p-2 w-full mb-3 rounded"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <div className="mb-3">Harga per PCS: Rp {price}</div>

        <div className="flex gap-3 flex-wrap items-center">
          <button
            type="button"
            onClick={addToCart}
            className="
w-auto
bg-blue-500
hover:bg-blue-600
transition
text-white
px-5
py-2
rounded-xl
"
          >
            Tambah ke Keranjang
          </button>

          <button
            type="button"
            onClick={() => setShowCart(true)}
            className="
w-auto
bg-purple-500
hover:bg-purple-600
transition
text-white
px-5
py-2
rounded-xl
"
          >
            Lihat Keranjang ({cart.length})
          </button>

          <button
            type="submit"
            disabled={cart.length === 0}
            onClick={(e) => {
              if (cart.length === 0) {
                e.preventDefault();

                toast.error("Masukkan keranjang terlebih dahulu");
              }
            }}
            className={`
  w-auto
  text-white
  px-5
  py-2
  rounded-xl
  transition

  ${
    cart.length === 0
      ? `
        bg-gray-400
        cursor-not-allowed
      `
      : `
        bg-green-500
        hover:bg-green-600
      `
  }
  `}
          >
            Checkout
          </button>
        </div>
      </form>

      <div className="bg-white p-5 rounded-2xl shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3">Pembeli</th>

              <th className="text-left p-3">Grand Total</th>

              <th className="text-left p-3">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b">
                <td className="p-3">{purchase.buyer_name}</td>

                <td className="p-3">Rp {purchase.grand_total}</td>

                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(purchase)}
                      className="
        w-auto
        bg-blue-500
        hover:bg-blue-600
        transition
        text-white
        px-4
        py-2
        rounded-xl
        "
                    >
                      Detail
                    </button>

                    <button
                      type="button"
                      onClick={() => deletePurchase(purchase.id)}
                      className="
        w-auto
        bg-red-500
        hover:bg-red-600
        transition
        text-white
        px-4
        py-2
        rounded-xl
        "
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showCart && (
        <div
          className="
  fixed
  inset-0
  bg-black/40
  backdrop-blur-sm
  flex
  justify-center
  items-center
  z-50
  "
        >
          <div
            className="
    bg-white
    p-5
    rounded-2xl
    shadow
    w-[700px]
    max-h-[80vh]
    overflow-auto
    "
          >
            <h2 className="text-2xl font-bold mb-4">Keranjang</h2>

            {cart.length === 0 ? (
              <p>Keranjang kosong</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Nama</th>
                    <th className="text-left">Qty</th>
                    <th className="text-left">Harga</th>
                    <th className="text-left">Subtotal</th>
                    <th className="text-left">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {cart.map((item) => (
                    <tr key={item.food_id}>
                      <td>{item.food_name}</td>

                      <td>{item.quantity}</td>

                      <td>Rp {item.price_per_pcs}</td>

                      <td>Rp {item.subtotal}</td>

                      <td>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.food_id)}
                          className="
                    bg-red-500
                    text-white
                    px-3
                    py-1
                    rounded-lg
                    w-auto
                    "
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="mt-5 text-xl font-bold">
              Grand Total: Rp {grandTotal}
            </div>

            <button
              type="button"
              onClick={() => setShowCart(false)}
              className="
              mt-5
              bg-gray-500
              text-white
              px-5
              py-2
              rounded-xl
              "
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showDetail && selectedPurchase && (
        <div
          className="
    fixed
    inset-0
    bg-black/40
    backdrop-blur-sm
    flex
    justify-center
    items-center
    z-50
    "
        >
          <div
            className="
      bg-white
      w-[700px]
      max-h-[80vh]
      overflow-auto
      rounded-3xl
      shadow-2xl
      p-6
      "
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-3xl font-bold">Detail Transaksi</h2>

              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="
          bg-gray-500
          hover:bg-gray-600
          transition
          text-white
          px-4
          py-2
          rounded-xl
          "
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <span className="font-bold">Nama Pembeli:</span>{" "}
                {selectedPurchase.buyer_name}
              </div>

              <div>
                <span className="font-bold">Tanggal Pembelian:</span>{" "}
                {new Date(selectedPurchase.created_at).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </div>

              <div>
                <span className="font-bold">Status:</span>

                <span
                  className="
            ml-2
            bg-green-100
            text-green-700
            px-3
            py-1
            rounded-full
            text-sm
            font-bold
            "
                >
                  TERBAYAR
                </span>
              </div>
            </div>

            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Makanan</th>

                  <th className="text-left p-3">Qty</th>

                  <th className="text-left p-3">Harga</th>

                  <th className="text-left p-3">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {selectedPurchase.items?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.name}</td>

                    <td className="p-3">{item.quantity}</td>

                    <td className="p-3">Rp {item.price_per_pcs}</td>

                    <td className="p-3">Rp {item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              className="
        mt-6
        text-right
        text-2xl
        font-bold
        "
            >
              Grand Total: Rp {selectedPurchase.grand_total}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
