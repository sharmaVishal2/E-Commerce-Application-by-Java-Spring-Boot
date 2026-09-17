import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { API_BASE_URL } from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { getCachedImageUrl, setCachedImageUrl } from "../utils/imageCache";
import ProductGridSkeleton from "./ui/ProductGridSkeleton";
import StatePanel from "./ui/StatePanel";

const CATEGORIES = [
  { name: "Laptop", icon: "💻" },
  { name: "Headphone", icon: "🎧" },
  { name: "Mobile", icon: "📱" },
  { name: "Electronics", icon: "📷" },
  { name: "Fashion", icon: "👟" },
  { name: "Toys", icon: "🧸" },
];

const BENEFITS = [
  { icon: "🔒", title: "Secure Payments", desc: "Your transactions are protected end-to-end." },
  { icon: "🚚", title: "Fast Delivery", desc: "Orders processed and dispatched quickly." },
  { icon: "✅", title: "Quality Products", desc: "Every item is reviewed before listing." },
  { icon: "↩️", title: "Easy Returns", desc: "Hassle-free returns within the return window." },
];

const resolveInitialImage = (p) => p.imageUrl || unplugged;

const Home = () => {
  const { data, isError, isLoading, refreshData } = useContext(AppContext);
  const [featuredCards, setFeaturedCards] = useState([]);
  const [backendWaking, setBackendWaking] = useState(false);
  const wakeAttempted = useRef(false);
  const navigate = useNavigate();

  const featuredProducts = useMemo(() => data.slice(0, 4), [data]);

  // Single lightweight backend wake-up on first mount
  useEffect(() => {
    if (wakeAttempted.current) return;
    wakeAttempted.current = true;
    setBackendWaking(true);
    axios
      .get("/health", { skipAuth: true, timeout: 15000 })
      .catch(() => {})
      .finally(() => setBackendWaking(false));
  }, []);

  useEffect(() => {
    if (!featuredProducts.length) { setFeaturedCards([]); return; }
    setFeaturedCards(featuredProducts.map((p) => ({ ...p, imageUrl: resolveInitialImage(p) })));
    let mounted = true;
    (async () => {
      const updated = await Promise.all(
        featuredProducts.map(async (p) => {
          if (p.imageUrl || !p.imageName) return { ...p, imageUrl: resolveInitialImage(p) };
          const cached = getCachedImageUrl(p.id);
          if (cached) return { ...p, imageUrl: cached };
          try {
            const res = await axios.get(`/product/${p.id}/image`, { skipAuth: true, responseType: "blob" });
            const url = URL.createObjectURL(res.data);
            setCachedImageUrl(p.id, url);
            return { ...p, imageUrl: url };
          } catch { return { ...p, imageUrl: unplugged }; }
        })
      );
      if (mounted) setFeaturedCards(updated);
    })();
    return () => { mounted = false; };
  }, [featuredProducts]);

  return (
    <div className="page">
      {/* HERO */}
      <section className="home-hero">
        <div className="shell home-hero__inner">
          <div>
            <div className="home-hero__eyebrow">
              <span>✦</span> New arrivals available
            </div>
            <h1>Shop smarter,<br />live better.</h1>
            <p className="home-hero__sub">
              Discover electronics, fashion, and everyday essentials — curated for quality,
              presented with clarity.
            </p>
            {backendWaking && (
              <div className="wakeup-notice" role="status">
                <span className="wakeup-dot" />
                Getting things ready… the backend may take a moment to wake up.
              </div>
            )}
            <div className="home-hero__actions">
              <Link to="/products" className="btn btn--primary btn--lg">Shop Now</Link>
              <Link to="/products" className="btn btn--secondary btn--lg">Explore Catalog</Link>
            </div>
          </div>
          <div className="home-hero__visual" aria-hidden="true">
            <div className="home-hero__img-card">
              <img
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=75"
                alt="Laptop"
                loading="lazy"
              />
            </div>
            <div className="home-hero__img-card">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=75"
                alt="Headphones"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Browse by category</p>
              <h2 className="section-title">What are you looking for?</h2>
            </div>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                aria-label={`Browse ${cat.name}`}
              >
                <span className="category-card__icon" aria-hidden="true">{cat.icon}</span>
                <span className="category-card__name">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="home-section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Featured products</p>
              <h2 className="section-title">Handpicked for you</h2>
              <p className="section-sub">A quick look at what's in the store right now.</p>
            </div>
            <Link to="/products" className="btn btn--secondary">View all</Link>
          </div>

          {isLoading && featuredCards.length === 0 ? (
            <ProductGridSkeleton count={4} />
          ) : isError ? (
            <StatePanel
              title="Unable to load products"
              description="The backend may still be waking up. Try again in a moment."
              actionLabel="Retry"
              onAction={refreshData}
              tone="error"
              compact
            />
          ) : featuredCards.length === 0 ? (
            <StatePanel
              title="No products yet"
              description="Products will appear here once the catalog loads."
              tone="empty"
              compact
            />
          ) : (
            <div className="products-grid">
              {featuredCards.map((p) => (
                <article key={p.id} className="product-card">
                  <Link to={`/product/${p.id}`} className="product-card__link">
                    <div className="product-card__img-wrap">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="product-card__img"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = unplugged; }}
                      />
                    </div>
                    <div className="product-card__body">
                      <p className="product-card__cat">{p.category}</p>
                      <p className="product-card__name">{p.name}</p>
                      <p className="product-card__brand">{p.brand}</p>
                      <div className="product-card__footer">
                        <span className="product-card__price">${p.price}</span>
                        <span className={`product-card__stock ${p.productAvailable ? "product-card__stock--in" : "product-card__stock--out"}`}>
                          {p.productAvailable ? "In stock" : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="home-section">
        <div className="shell">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Why shop with us</p>
              <h2 className="section-title">Built around you</h2>
            </div>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit-card">
                <div className="benefit-card__icon" aria-hidden="true">{b.icon}</div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNER */}
      <section className="home-section">
        <div className="shell">
          <div className="promo-banner">
            <div className="promo-banner__text">
              <h2>Explore the full catalog</h2>
              <p>Browse all categories, filter by price, and find exactly what you need.</p>
            </div>
            <Link to="/products" className="btn btn--primary btn--lg">Shop all products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
