import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import {
  UtensilsCrossed,
  ShoppingCart,
} from "lucide-react";

import FoodPage from "./pages/FoodPage";
import PurchasePage from "./pages/PurchasePage";

function App() {
  return (
    <BrowserRouter>

      <div className="flex min-h-screen bg-[#f4f7fb]">

        {/* SIDEBAR */}
        <div
  className="
  w-72
  bg-gradient-to-b
  from-slate-900
  to-slate-800
  text-white
  shadow-2xl
  p-6
  flex
  flex-col
  "
>

          <div className="mb-10">
  <h1 className="text-2xl font-black tracking-wide">
    KANTIN BAZMA
  </h1>

  <p className="text-slate-300 text-sm mt-2">
    SMK TI BAZMA
  </p>
</div>

          <div className="flex flex-col gap-3">

            <Link
              to="/foods"
              className="
              flex items-center gap-2
              bg-blue-500
              hover:bg-blue-600
              transition
              text-white
              p-3
              rounded-2xl
              "
            >
              <UtensilsCrossed size={20} />
              Daftar Makanan
            </Link>

            <Link
              to="/purchases"
              className="
              flex items-center gap-2
              bg-green-500
              hover:bg-green-600
              transition
              text-white
              p-3
              rounded-2xl
              "
            >
              <ShoppingCart size={20} />
              Data Pembelian
            </Link>

          </div>

        </div>

        {/* CONTENT */}
        <div className="flex-1 p-8">

          <Routes>
            <Route
              path="/foods"
              element={<FoodPage />}
            />

            <Route
              path="/purchases"
              element={<PurchasePage />}
            />
          </Routes>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;