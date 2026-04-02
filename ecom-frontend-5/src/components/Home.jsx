import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import unplugged from "../assets/unplugged.png";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const objectUrls = [];

    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get("/products");
        const featured = response.data.slice(0, 2);
        const featuredWithImages = await Promise.all(
          featured.map(async (product) => {
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
          setFeaturedProducts(featuredWithImages);
        }
      } catch (error) {
        if (isMounted) {
          setFeaturedProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFeatured(false);
        }
      }
    };

    fetchFeaturedProducts();

    return () => {
      isMounted = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="hero-tag">Vishal Storefront</p>
          <h1>Shop practical tech and lifestyle picks without waiting on a heavy first load.</h1>
          <p className="hero-description">
            Browse a lightweight landing page first, then jump into the full catalog
            once the backend is already warm. Faster first impression, same store.
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
            <span className="hero-panel-label">Why this layout</span>
            <h3>Render wakes up in the background while users get a usable homepage.</h3>
            <p>
              Featured products below still trigger a small API call, so by the time
              someone clicks into the catalog the backend is often already responsive.
            </p>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="featured-header">
          <div>
            <p className="hero-tag">Featured Preview</p>
            <h2>Two products loaded early to warm the backend</h2>
          </div>
          <Link to="/products" className="featured-link">
            See full catalog
          </Link>
        </div>

        {isLoadingFeatured ? (
          <div className="featured-placeholder">
            <h3>Loading featured products...</h3>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="featured-placeholder">
            <h3>Featured products are not available right now.</h3>
          </div>
        ) : (
          <div className="featured-grid">
            {featuredProducts.map((product) => (
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
