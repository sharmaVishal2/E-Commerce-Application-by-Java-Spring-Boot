import { Link } from "react-router-dom";
import unplugged from "../../assets/unplugged.png";

const resolveDiscount = (product) => {
  const rawDiscount = Number(product.discountPercentage ?? product.discount ?? 0);
  return Number.isFinite(rawDiscount) && rawDiscount > 0 ? Math.round(rawDiscount) : 0;
};

const ProductCard = ({ product, onAddToCart }) => {
  const { id, brand, name, price, category, productAvailable, imageUrl } = product;
  const discount = resolveDiscount(product);

  return (
    <article className={`product-card ${!productAvailable ? "product-card--muted" : ""}`}>
      <Link to={`/product/${id}`} className="product-card__link">
        <div className="product-card__media">
          {discount > 0 ? <span className="product-card__badge">{discount}% off</span> : null}
          <img
            src={imageUrl || unplugged}
            alt={name}
            className="product-card__image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = unplugged;
            }}
          />
        </div>
        <div className="product-card__body">
          <p className="product-card__category">{category}</p>
          <h3>{name}</h3>
          <p className="product-card__brand">{brand}</p>
          <div className="product-card__meta">
            <div>
              <span className="product-card__price">${price}</span>
              <span className={`product-card__stock ${productAvailable ? "is-available" : "is-unavailable"}`}>
                {productAvailable ? "In stock" : "Out of stock"}
              </span>
            </div>
            <button
              className="button button--primary product-card__button"
              type="button"
              onClick={(event) => {
                event.preventDefault();
                onAddToCart(product);
              }}
              disabled={!productAvailable}
            >
              {productAvailable ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
