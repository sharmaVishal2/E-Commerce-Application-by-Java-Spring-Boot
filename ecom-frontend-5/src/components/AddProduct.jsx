import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";

const CATEGORIES = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "", brand: "", description: "", price: "",
    category: "", stockQuantity: "", releaseDate: "", productAvailable: false,
  });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData();
    if (image) formData.append("imageFile", image);
    formData.append("product", new Blob([JSON.stringify(product)], { type: "application/json" }));
    try {
      await axios.post("/product", formData);
      setSuccess(true);
      setTimeout(() => navigate("/products"), 1500);
    } catch (err) {
      setError(err.response?.status === 401 ? "Please log in as admin." : "Failed to add product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="shell admin-page">
        <h1>Add Product</h1>
        {success && (
          <div className="alert-error" style={{ background: "rgba(29,131,72,0.08)", borderColor: "rgba(29,131,72,0.2)", color: "var(--success)", marginBottom: "1rem" }}>
            Product added successfully! Redirecting…
          </div>
        )}
        {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="ap-name">Name</label>
            <input id="ap-name" className="field-input" name="name" value={product.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ap-brand">Brand</label>
            <input id="ap-brand" className="field-input" name="brand" value={product.brand} onChange={handleChange} />
          </div>
          <div className="field admin-form__full">
            <label className="field-label" htmlFor="ap-desc">Description</label>
            <textarea id="ap-desc" className="field-textarea" name="description" rows={3} value={product.description} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ap-price">Price ($)</label>
            <input id="ap-price" className="field-input" type="number" name="price" min="0" step="0.01" value={product.price} onChange={handleChange} required />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ap-cat">Category</label>
            <select id="ap-cat" className="field-select" name="category" value={product.category} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ap-stock">Stock Quantity</label>
            <input id="ap-stock" className="field-input" type="number" name="stockQuantity" min="0" value={product.stockQuantity} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ap-date">Release Date</label>
            <input id="ap-date" className="field-input" type="date" name="releaseDate" value={product.releaseDate} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="ap-img">Product Image</label>
            <input id="ap-img" className="field-input" type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ padding: "0.5rem 0.9rem" }} />
          </div>
          <div className="field admin-form__full">
            <div className="form-check-row">
              <input
                id="ap-avail"
                className="form-check-input"
                type="checkbox"
                name="productAvailable"
                checked={product.productAvailable}
                onChange={(e) => setProduct((p) => ({ ...p, productAvailable: e.target.checked }))}
              />
              <label className="field-label" htmlFor="ap-avail" style={{ margin: 0 }}>Product Available</label>
            </div>
          </div>
          <div className="admin-form__full" style={{ display: "flex", gap: "0.75rem" }}>
            <button className={`btn btn--primary${submitting ? " btn--loading" : ""}`} type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add Product"}
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => navigate("/products")}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
