import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import unplugged from "../assets/unplugged.png";

const CATEGORIES = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: null, name: "", description: "", brand: "", price: "",
    category: "", releaseDate: "", productAvailable: false, stockQuantity: "",
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(unplugged);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/product/${id}`, { skipAuth: true });
        setForm({
          ...res.data,
          releaseDate: res.data.releaseDate
            ? new Date(res.data.releaseDate).toISOString().split("T")[0]
            : "",
        });
        try {
          const imgRes = await axios.get(`/product/${id}/image`, { skipAuth: true, responseType: "blob" });
          const file = new File([imgRes.data], res.data.imageName || "image", { type: imgRes.data.type });
          setImage(file);
          setPreviewUrl(URL.createObjectURL(imgRes.data));
        } catch { setPreviewUrl(unplugged); }
      } catch { setError("Failed to load product."); }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const formData = new FormData();
    if (image) formData.append("imageFile", image);
    formData.append("product", new Blob([JSON.stringify(form)], { type: "application/json" }));
    try {
      await axios.put(`/product/${id}`, formData);
      setSuccess(true);
      setTimeout(() => navigate(`/product/${id}`), 1500);
    } catch { setError("Failed to update product."); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page">
      <div className="shell admin-page">
        <h1>Update Product</h1>
        {success && (
          <div className="alert-error" style={{ background: "rgba(29,131,72,0.08)", borderColor: "rgba(29,131,72,0.2)", color: "var(--success)", marginBottom: "1rem" }}>
            Product updated! Redirecting…
          </div>
        )}
        {error && <div className="alert-error" style={{ marginBottom: "1rem" }}>{error}</div>}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="up-name">Name</label>
            <input id="up-name" className="field-input" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="up-brand">Brand</label>
            <input id="up-brand" className="field-input" name="brand" value={form.brand} onChange={handleChange} />
          </div>
          <div className="field admin-form__full">
            <label className="field-label" htmlFor="up-desc">Description</label>
            <textarea id="up-desc" className="field-textarea" name="description" rows={3} value={form.description} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="up-price">Price ($)</label>
            <input id="up-price" className="field-input" type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} required />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="up-cat">Category</label>
            <select id="up-cat" className="field-select" name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="up-stock">Stock Quantity</label>
            <input id="up-stock" className="field-input" type="number" name="stockQuantity" min="0" value={form.stockQuantity} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="up-date">Release Date</label>
            <input id="up-date" className="field-input" type="date" name="releaseDate" value={form.releaseDate} onChange={handleChange} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="up-img">Product Image</label>
            <img src={previewUrl} alt="Preview" className="admin-form__preview" />
            <input id="up-img" className="field-input" type="file" accept="image/*" onChange={handleImageChange} style={{ padding: "0.5rem 0.9rem" }} />
          </div>
          <div className="field admin-form__full">
            <div className="form-check-row">
              <input
                id="up-avail"
                className="form-check-input"
                type="checkbox"
                checked={form.productAvailable}
                onChange={(e) => setForm((f) => ({ ...f, productAvailable: e.target.checked }))}
              />
              <label className="field-label" htmlFor="up-avail" style={{ margin: 0 }}>Product Available</label>
            </div>
          </div>
          <div className="admin-form__full" style={{ display: "flex", gap: "0.75rem" }}>
            <button className={`btn btn--primary${submitting ? " btn--loading" : ""}`} type="submit" disabled={submitting}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => navigate(`/product/${id}`)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
