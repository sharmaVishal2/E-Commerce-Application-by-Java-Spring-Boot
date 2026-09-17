import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppContext from "../Context/Context";
import AuthContext from "../Context/AuthContext";
import axios from "../axios";
import unplugged from "../assets/unplugged.png";
import { findStaticProductById } from "../data/staticProducts";
import ProductCard from "./ui/ProductCard";
import StatePanel from "./ui/StatePanel";

const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let objectUrl = null;
    setImageLoading(true);
    setProduct(null);
    setQuantity(1);

    const fetchProduct = async () => {
      try {
        const staticProduct = findStaticProductById(id);
        if (staticProduct) {
          setProduct(staticProduct);
          setImageUrl(staticProduct.imageUrl || unplugged);
          setImageLoading(false);
          return;
        }
        const [productRes] = await Promise.allSettled([
          axios.get(`/product/${id}`, { skipAuth: true }),
        ]);
        if (productRes.status === "fulfilled") {
          setProduct(productRes.value.data);
          if (!productRes.value.data.imageName) {
            setImageUrl(unplugged);
            setImageLoading(false);
            return;
          }
          try {
            const imgRes = await axios.get(`/product/${id}/image`, { skipAuth: true, responseType: "blob" });
            objectUrl = URL.createObjectURL(imgRes.data);
            setImageUrl(objectUrl);
          } catch { setImageUrl(unplugged); }
        } else {
          const fallback = findStaticProductById(id);
          if (fallback) { setProduct(fallback); setImageUrl(fallback.imageUrl || unplugged); }
        }
      } catch {
        const fallback = findStaticProductById(id);
        if (fallback) { setProduct(fallback); setImageUrl(fallback.imageUrl || unplugged); }
        else setImageUrl(unplugged);
      } finally { setImageLoading(false); }
    };

    fetchProduct();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/product/${id}`);
      removeFromCart(Number(id));
      refreshData();
      navigate("/products");
    } catch { alert("Failed to delete product."); }
  };

  const relatedProducts = data
    .filter((item) => item.id !== product?.id && item.category === product?.category)
    .slice(0, 4);

  if (!product && !imageLoading) {
    return (
      <div className="page">
        <div className="shell" style={{ paddingTop: "3rem" }}>
          <StatePanel
            title="Product not found"
            description="This product may have been removed or the link is incorrect."
            actionLabel="Browse all products"
            onAction={() => navigate("/products")}
            tone="error"
          />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <div className="shell product-detail">
          <div className="product-detail__grid">
            <div className="skel" style={{ borderRadius: "var(--radius-xl)", aspectRatio: "1", minHeight: 300 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1rem" }}>
              <div className="skel skel--line skel--line-sm" />
              <div className="skel skel--line skel--line-lg" style={{ height: 32 }} />
              <div className="skel skel--line skel--line-md" />
              <div className="skel skel--line skel--line-lg" />
              <div className="skel skel--btn" style={{ marginTop: "1rem" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="shell product-detail">
        <div className="product-detail__grid">
          {/* Image */}
          <div className="product-detail__img-wrap">
            {imageLoading ? (
              <div className="product-detail__img-placeholder">
                <div className="skel" style={{ width: "100%", height: "100%", borderRadius: 0 }} />
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={product.name}
                className="product-detail__img"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = unplugged; }}
              />
            )}
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <p className="product-detail__cat">{product.category}</p>
            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__brand">{product.brand}</p>

            <div className="product-detail__meta">
              <span className="product-detail__price">${product.price}</span>
              <span className={`product-detail__stock ${product.productAvailable ? "product-detail__stock--in" : "product-detail__stock--out"}`}>
                {product.productAvailable ? "In stock" : "Out of stock"}
              </span>
              {product.stockQuantity != null && (
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  {product.stockQuantity} available
                </span>
              )}
            </div>

            {product.description && (
              <p className="product-detail__desc">{product.description}</p>
            )}

            {product.releaseDate && (
              <p className="product-detail__listed">
                Listed: {new Date(product.releaseDate).toLocaleDateString()}
              </p>
            )}

            <div className="product-detail__qty-row">
              <div className="qty-control" aria-label="Quantity">
                <button
                  className="qty-btn"
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >−</button>
                <span className="qty-value">{quantity}</span>
                <button
                  className="qty-btn"
                  type="button"
                  aria-label="Increase quantity"
                  disabled={product.stockQuantity != null && quantity >= product.stockQuantity}
                  onClick={() => setQuantity((q) => q + 1)}
                >+</button>
              </div>
            </div>

            <div className="product-detail__actions">
              <button
                className="btn btn--primary btn--lg"
                type="button"
                disabled={!product.productAvailable}
                onClick={handleAddToCart}
              >
                {addedFeedback ? "✓ Added!" : "Add to Cart"}
              </button>
              <button
                className="btn btn--secondary btn--lg"
                type="button"
                disabled={!product.productAvailable}
                onClick={() => { addToCart(product, quantity); navigate("/cart"); }}
              >
                Buy Now
              </button>
            </div>

            {isAuthenticated && product.source !== "static" && (
              <div className="product-detail__admin-actions">
                <button
                  className="btn btn--secondary btn--sm"
                  type="button"
                  onClick={() => navigate(`/product/update/${id}`)}
                >
                  <i className="bi bi-pencil" /> Edit
                </button>
                <button
                  className="btn btn--danger btn--sm"
                  type="button"
                  onClick={handleDelete}
                >
                  <i className="bi bi-trash" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="shell related-section">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">You may also like</p>
              <h2 className="section-title">More from {product.category}</h2>
            </div>
          </div>
          <div className="related-grid">
            {relatedProducts.map((r) => (
              <button
                key={r.id}
                className="related-card"
                type="button"
                onClick={() => navigate(`/product/${r.id}`)}
              >
                <span className="related-card__name">{r.name}</span>
                <span className="related-card__price">${r.price}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;
