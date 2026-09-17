import { Link } from "react-router-dom";
import unplugged from "../../assets/unplugged.png";

const resolveDiscount = (p) => {
  const d = Number(p.discountPercentage ?? p.discount ?? 0);
  return Number.isFinite(d) && d > 0 ? Math.round(d) : 0;
};

const ProductCard = ({ product, onAddToCart }) => {
  const { id, brand, name, price, category, productAvailable, imageUrl, rating } = product;
  const discount = resolveDiscount(product);

  return (
    <article className={`product-card${!productAvailable ? " product-card--unavailable" : ""}`}>
      <Link to={`/product/${id}`} className="product-card__link" tabIndex={-1} aria-hidden="true">
        <div className="product-card__img-wrap">
          {discount > 0 && (
            <span className="product-card__badge" aria-label={`${discount}% off`}>{discount}% off</span>
          )}
          <img
            src={imageUrl || unplugged}
            alt={name}
            className="product-card__img"
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = unplugged; }}
          />
        </div>
      </Link>
      <div className="product-card__body">
        <p className="product-card__cat">{category}</p>
        <Link to={`/product/${id}`} style={{ textDecoration: "none" }}>
          <p className="product-card__name">{name}</p>
        </Link>
        <p className="product-card__brand">{brand}</p>
        {rating != null && (
          <p style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: 600 }} aria-label={`${rating} out of 5`}>
            ★ {rating}
          </p>
        )}
        <div className="product-card__footer">
          <div>
            <span className="product-card__price">${price}</span>
            <br />
            <span className={`product-card__stock ${productAvailable ? "product-card__stock--in" : "product-card__stock--out"}`}>
              {productAvailable ? "In stock" : "Out of stock"}
            </span>
          </div>
          <button
            className="product-card__add"
            type="button"
            aria-label={productAvailable ? `Add ${name} to cart` : "Out of stock"}
            disabled={!productAvailable}
            onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          >
            <i className="bi bi-plus-lg" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
