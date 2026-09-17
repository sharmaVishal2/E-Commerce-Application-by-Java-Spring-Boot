import { useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect } from "react";
import { useState } from "react";
import AppContext from "../Context/Context";
import AuthContext from "../Context/AuthContext";
import axios from "../axios";
import unplugged from "../assets/unplugged.png";
import { findStaticProductById } from "../data/staticProducts";

const Product = () => {
  const { id } = useParams();
  const { data, addToCart, removeFromCart, refreshData } = useContext(AppContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let objectUrl = null;

    const fetchProduct = async () => {
      try {
        const staticProduct = findStaticProductById(id);
        if (staticProduct) {
          setProduct(staticProduct);
          setImageUrl(staticProduct.imageUrl || unplugged);
          return;
        }

        const productRequest = axios.get(`/product/${id}`, { skipAuth: true });
        const imageRequest = axios.get(`/product/${id}/image`, {
          skipAuth: true,
          responseType: "blob",
        });

        const response = await productRequest;
        setProduct(response.data);

        if (!response.data.imageName) {
          setImageUrl(unplugged);
          setIsImageLoading(false);
          return;
        }

        try {
          const imageResponse = await imageRequest;
          objectUrl = URL.createObjectURL(imageResponse.data);
          setImageUrl(objectUrl);
        } catch (error) {
          setImageUrl(unplugged);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        const staticProduct = findStaticProductById(id);
        if (staticProduct) {
          setProduct(staticProduct);
          setImageUrl(staticProduct.imageUrl || unplugged);
        } else {
          setImageUrl(unplugged);
        }
      } finally {
        setIsImageLoading(false);
      }
    };

    setIsImageLoading(true);
    fetchProduct();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id]);

  const deleteProduct = async () => {
    try {
      await axios.delete(`/product/${id}`);
      removeFromCart(Number(id));
      console.log("Product deleted successfully");
      alert("Product deleted successfully");
      refreshData();
      navigate("/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEditClick = () => {
    navigate(`/product/update/${id}`);
  };

  const handlAddToCart = () => {
    addToCart(product, quantity);
  };
  const relatedProducts = data
    .filter((item) => item.id !== product?.id && item.category === product?.category)
    .slice(0, 4);
  if (!product) {
    return (
      <h2 className="text-center" style={{ padding: "10rem" }}>
        Loading...
      </h2>
    );
  }
  return (
    <>
      <div className="containers" style={{ display: "flex" }}>
        <div className="product-image-panel">
          {isImageLoading ? (
            <div className="product-image-placeholder">
              <span>Loading image...</span>
            </div>
          ) : (
            <img
              className="left-column-img"
              src={imageUrl}
              alt={product.imageName}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = unplugged;
              }}
            />
          )}
        </div>

        <div className="right-column" style={{ width: "50%" }}>
          <div className="product-description">
            <div style={{display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 'lighter' }}>
              {product.category}
            </span>
            <div className="release-date" style={{ marginBottom: "2rem" }}>
              <h6>
                Listed : <span><i>{new Date(product.releaseDate).toLocaleDateString()}</i></span>
              </h6>
            </div>
            </div>
            
           
            <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem",textTransform: 'capitalize', letterSpacing:'1px' }}>
              {product.name}
            </h1>
            <i style={{ marginBottom: "3rem" }}>{product.brand}</i>
            <p style={{fontWeight:'bold',fontSize:'1rem',margin:'10px 0px 0px'}}>PRODUCT DESCRIPTION :</p>
            <p style={{ marginBottom: "1rem" }}>{product.description}</p>
          </div>

          <div className="product-price">
            <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
              {"$" + product.price}
            </span>
            <div className="quantity-control" aria-label="Product quantity">
              <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Decrease quantity">-</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((current) => Math.min(product.stockQuantity || current + 1, current + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button
              className={`cart-btn ${
                !product.productAvailable ? "disabled-btn" : ""
              }`}
              onClick={handlAddToCart}
              disabled={!product.productAvailable}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {product.productAvailable ? "Add to cart" : "Out of Stock"}
            </button>
            <button className="button button--secondary" type="button" onClick={handlAddToCart} disabled={!product.productAvailable}>Buy now</button>
            <h6 style={{ marginBottom: "1rem" }}>
              Stock Available :{" "}
              <i style={{ color: "green", fontWeight: "bold" }}>
                {product.stockQuantity}
              </i>
            </h6>
          
          </div>
          <div className="update-button" style={{ display: "flex", gap: "1rem" }}>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleEditClick}
              disabled={!isAuthenticated || product.source === "static"}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Update
            </button>
            {/* <UpdateProduct product={product} onUpdate={handleUpdate} /> */}
            <button
              className="btn btn-primary"
              type="button"
              onClick={deleteProduct}
              disabled={!isAuthenticated || product.source === "static"}
              style={{
                padding: "1rem 2rem",
                fontSize: "1rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      {relatedProducts.length > 0 ? (
        <section className="related-products storefront-shell">
          <div className="featured-header">
            <div>
              <p className="eyebrow">You may also like</p>
              <h2>More from {product.category}</h2>
            </div>
          </div>
          <div className="products-grid">
            {relatedProducts.map((related) => (
              <button className="related-product" type="button" key={related.id} onClick={() => navigate(`/product/${related.id}`)}>
                <strong>{related.name}</strong>
                <span>${related.price}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
};

export default Product;
