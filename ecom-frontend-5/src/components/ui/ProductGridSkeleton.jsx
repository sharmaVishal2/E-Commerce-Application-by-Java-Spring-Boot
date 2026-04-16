const ProductCardSkeleton = () => {
  return (
    <article className="product-card product-card--skeleton" aria-hidden="true">
      <div className="product-card__image skeleton-block" />
      <div className="product-card__body">
        <div className="skeleton-line skeleton-line--sm" />
        <div className="skeleton-line skeleton-line--lg" />
        <div className="skeleton-line skeleton-line--md" />
        <div className="product-card__meta">
          <div className="skeleton-line skeleton-line--xs" />
          <div className="skeleton-line skeleton-line--sm" />
        </div>
        <div className="skeleton-line skeleton-line--button" />
      </div>
    </article>
  );
};

const FeaturedCardSkeleton = () => {
  return (
    <article className="featured-card featured-card--skeleton" aria-hidden="true">
      <div className="featured-card__image skeleton-block" />
      <div className="featured-card__body">
        <div className="skeleton-line skeleton-line--xs" />
        <div className="skeleton-line skeleton-line--md" />
        <div className="skeleton-line skeleton-line--sm" />
        <div className="featured-card__footer">
          <div className="skeleton-line skeleton-line--xs" />
          <div className="skeleton-line skeleton-line--xs" />
        </div>
      </div>
    </article>
  );
};

const ProductGridSkeleton = ({ count = 8, variant = "grid" }) => {
  const items = Array.from({ length: count }, (_, index) => index);
  const Item = variant === "featured" ? FeaturedCardSkeleton : ProductCardSkeleton;

  return (
    <div className={variant === "featured" ? "featured-grid" : "products-grid"}>
      {items.map((item) => (
        <Item key={item} />
      ))}
    </div>
  );
};

export default ProductGridSkeleton;
