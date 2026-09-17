const CardSkeleton = () => (
  <article className="product-card" aria-hidden="true">
    <div className="product-card__img-wrap">
      <div className="skel skel--img" style={{ height: 220 }} />
    </div>
    <div className="product-card__body" style={{ gap: "0.6rem" }}>
      <div className="skel skel--line skel--line-sm" />
      <div className="skel skel--line skel--line-lg" />
      <div className="skel skel--line skel--line-md" />
      <div className="product-card__footer" style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
        <div className="skel skel--line skel--line-sm" />
        <div className="skel" style={{ width: 34, height: 34, borderRadius: "50%" }} />
      </div>
    </div>
  </article>
);

const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="products-grid">
    {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
  </div>
);

export default ProductGridSkeleton;
