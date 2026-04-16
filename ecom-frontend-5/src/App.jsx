import "./App.css";
import { Suspense, lazy, useState } from "react";
import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteFallback from "./components/ui/RouteFallback";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const Home = lazy(() => import("./components/Home"));
const Products = lazy(() => import("./components/Products"));
const Cart = lazy(() => import("./components/Cart"));
const AddProduct = lazy(() => import("./components/AddProduct"));
const Product = lazy(() => import("./components/Product"));
const UpdateProduct = lazy(() => import("./components/UpdateProduct"));
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const OAuthCallback = lazy(() => import("./components/OAuthCallback"));

function App() {
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <BrowserRouter>
      <Navbar onSelectCategory={handleCategorySelect} />
      <Suspense
        fallback={<RouteFallback message="Loading storefront..." />}
      >
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/products"
            element={<Products selectedCategory={selectedCategory} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route
            path="/add_product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route path="/product" element={<Product />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/product/update/:id"
            element={
              <ProtectedRoute>
                <UpdateProduct />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
