import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const Home = () => {
  const {
    featuredProducts,
    isFeaturedLoading,
    loadFeaturedProducts,
  } = useContext(AppContext);
  const [featuredCards, setFeaturedCards] = useState([]);

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  useEffect(() => {
    if (!featuredProducts || featuredProducts.length === 0) {
      setFeaturedCards([]);
      return;
    }

    setFeaturedCards(
      featuredProducts.map((product) => ({ ...product, imageUrl: unplugged }))
    );

    let isMounted = true;
    const objectUrls = [];

    const hydrateFeaturedImages = async () => {
      const updated = await Promise.all(
        featuredProducts.map(async (product) => {
          if (!product.imageName) {
            return { ...product, imageUrl: unplugged };
          }

          try {
            const imageResponse = await axios.get(`/product/${product.id}/image`, {
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(imageResponse.data);
            objectUrls.push(imageUrl);
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
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [featuredProducts]);

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="hero-tag">Vishal Storefront</p>
          <h1>Your destination for everyday tech, fashion, and lifestyle essentials.</h1>
          <p className="hero-description">
            Explore a curated ecommerce experience built for practical shopping:
            smartphones, laptops, headphones, electronics, fashion, and more in one
            clean catalog. Start here, then move into the full product collection
            when you are ready to browse.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="hero-button primary">
              Browse Products
            </Link>
            <a
              className="hero-button secondary"
              href="https://sharmavishal2.github.io/Portfolio/"
              target="_blank"
              rel="noreferrer"
            >
              View Portfolio
            </a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-card">
            <span className="hero-panel-label">About The Store</span>
            <h3>Built to showcase products clearly, with a faster first experience for visitors.</h3>
            <p>
              The featured section below loads a small product preview first. That gives
              visitors something useful to see immediately and also helps wake the
              backend before they open the full catalog.
            </p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <div>
            <p className="hero-tag">Featured Preview</p>
            <h2>Start with a quick look at a few products from the store</h2>
          </div>
          <Link to="/products" className="featured-link">
            See full catalog
          </Link>
        </div>

        {isLoadingFeatured ? (
          <div className="featured-placeholder">
            <h3>Loading featured products...</h3>
          </div>
        ) : featuredCards.length === 0 ? (
          <div className="featured-placeholder">
            <h3>Featured products are not available right now.</h3>
          </div>
        ) : (
          <div className="featured-grid">
            {featuredCards.map((product) => (
              <Link to={`/product/${product.id}`} className="featured-card" key={product.id}>
                <img src={product.imageUrl} alt={product.name} className="featured-image" />
                <div className="featured-body">
                  <p className="featured-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="featured-brand">{product.brand}</p>
                  <div className="featured-footer">
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
