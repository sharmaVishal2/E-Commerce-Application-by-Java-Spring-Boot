import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { getCachedImageUrl, setCachedImageUrl } from "../utils/imageCache";
import ProductGridSkeleton from "./ui/ProductGridSkeleton";
import StatePanel from "./ui/StatePanel";

const resolveInitialImage = (product) => product.imageUrl || unplugged;

const Home = () => {
  const { data, isError, isLoading, refreshData } = useContext(AppContext);
  const [featuredCards, setFeaturedCards] = useState([]);
  const featuredProducts = useMemo(() => data.slice(0, 2), [data]);

  useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0) {
      setFeaturedCards([]);
      return;
    }

    setFeaturedCards(
      featuredProducts.map((product) => ({ ...product, imageUrl: resolveInitialImage(product) }))
    );

    let isMounted = true;

    const hydrateFeaturedImages = async () => {
      const updated = await Promise.all(
        featuredProducts.map(async (product) => {
          if (product.imageUrl || !product.imageName) {
            return { ...product, imageUrl: resolveInitialImage(product) };
          }

          const cachedImageUrl = getCachedImageUrl(product.id);
          if (cachedImageUrl) {
            return { ...product, imageUrl: cachedImageUrl };
          }

          try {
            const imageResponse = await axios.get(`/product/${product.id}/image`, {
              skipAuth: true,
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(imageResponse.data);
            setCachedImageUrl(product.id, imageUrl);
            return { ...product, imageUrl };
          } catch (error) {
            return { ...product, imageUrl: unplugged };
          }
        })
      );

      if (isMounted) {
        setFeaturedCards(updated);
      }
    };

    hydrateFeaturedImages();

    return () => {
      isMounted = false;
    };
  }, [featuredProducts]);

  return (
    <div className="landing-page storefront-shell">
      <section className="hero-section">
        <div className="hero-copy hero-card">
          <p className="eyebrow">Fresh arrivals</p>
          <h1>Modern essentials for everyday shopping, presented with less friction.</h1>
          <p className="hero-description">
            Browse a cleaner storefront for electronics, fashion, and lifestyle picks with
            clearer pricing, calmer spacing, and a smoother first-load experience.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="button button--primary button--large">
              Shop Now
            </Link>
            <Link to="/products" className="button button--secondary button--large">
              Explore Catalog
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-card hero-card">
            <span className="eyebrow">Why it feels faster</span>
            <h3>Skeletons render immediately so the storefront never drops into a blank screen.</h3>
            <p>
              The backend can take a few seconds to wake up, so the homepage shows stable
              placeholders and featured previews while product data arrives.
            </p>
            <div className="hero-stat-grid">
              <div className="hero-stat-card">
                <strong>Responsive</strong>
                <span>Mobile-first spacing and layout</span>
              </div>
              <div className="hero-stat-card">
                <strong>Perceived speed</strong>
                <span>Stable skeletons and no abrupt layout jumps</span>
              </div>
            </div>
            <p className="hero-note">First fetch may still pause briefly while Render wakes the API.</p>
          </div>
        </div>
      </section>

      <section className="featured-section section-card">
        <div className="featured-header">
          <div>
            <p className="eyebrow">Featured Preview</p>
            <h2>Start with a quick look at a few products from the store</h2>
            <p className="section-copy">A small preview loads first to give visitors immediate visual feedback.</p>
          </div>
          <Link to="/products" className="button button--secondary">
            See full catalog
          </Link>
        </div>

        {isLoading && featuredCards.length === 0 ? (
          <div className="section-stack">
            <p className="loading-copy">Loading products...</p>
            <ProductGridSkeleton count={2} variant="featured" />
          </div>
        ) : isError ? (
          <StatePanel
            title="Unable to load featured products"
            description="The backend may still be waking up. Retry in a moment."
            actionLabel="Retry"
            onAction={refreshData}
            tone="error"
            compact
          />
        ) : featuredCards.length === 0 ? (
          <StatePanel
            title="No featured products available"
            description="Products will appear here once the catalog responds."
            compact
            tone="empty"
          />
        ) : (
          <div className="featured-grid">
            {featuredCards.map((product) => (
              <Link to={`/product/${product.id}`} className="featured-card" key={product.id}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="featured-card__image"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = unplugged;
                  }}
                />
                <div className="featured-card__body">
                  <p className="featured-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="featured-brand">{product.brand}</p>
                  <div className="featured-card__footer">
                    <span>${product.price}</span>
                    <span>{product.productAvailable ? "In stock" : "Out of stock"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
