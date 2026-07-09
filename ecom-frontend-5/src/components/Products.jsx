import { useContext, useEffect, useState } from "react";
import axios from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { getCachedImageUrl, setCachedImageUrl } from "../utils/imageCache";
import ProductCard from "./ui/ProductCard";
import ProductGridSkeleton from "./ui/ProductGridSkeleton";
import StatePanel from "./ui/StatePanel";

const resolveInitialImage = (product) => product.imageUrl || unplugged;

const Products = ({ selectedCategory }) => {
  const { data, isError, isLoading, addToCart, refreshData } = useContext(AppContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setProducts([]);
      return;
    }

    setProducts(data.map((product) => ({ ...product, imageUrl: resolveInitialImage(product) })));

    let isMounted = true;

    const fetchImagesAndUpdateProducts = async () => {
      const updatedProducts = await Promise.all(
        data.map(async (product) => {
          if (product.imageUrl || !product.imageName) {
            return { ...product, imageUrl: resolveInitialImage(product) };
          }

          const cachedImageUrl = getCachedImageUrl(product.id);
          if (cachedImageUrl) {
            return { ...product, imageUrl: cachedImageUrl };
          }

          try {
            const response = await axios.get(`/product/${product.id}/image`, {
              skipAuth: true,
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(response.data);
            setCachedImageUrl(product.id, imageUrl);
            return { ...product, imageUrl };
          } catch (error) {
            return { ...product, imageUrl: unplugged };
          }
        })
      );

      if (isMounted) {
        setProducts(updatedProducts);
      }
    };

    fetchImagesAndUpdateProducts();

    return () => {
      isMounted = false;
    };
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  if (isError) {
    return (
      <section className="products-page storefront-shell">
        <div className="catalog-intro section-card">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Products</h1>
            <p className="section-copy">The product service may still be waking up.</p>
          </div>
        </div>
        <StatePanel
          title="We couldn't load the catalog"
          description="The API request failed. Retry once the backend is awake."
          actionLabel="Retry"
          onAction={refreshData}
          tone="error"
        />
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="products-page storefront-shell">
        <div className="catalog-intro section-card">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Products</h1>
            <p className="section-copy">
              Loading products... the first request can take a few seconds if Render is resuming the backend.
            </p>
          </div>
        </div>
        <div className="products-wakeup-note">Loading products...</div>
        <ProductGridSkeleton count={8} />
      </section>
    );
  }

  return (
    <section className="products-page storefront-shell">
      <div className="catalog-intro section-card">
        <div>
          <p className="eyebrow">Catalog</p>
          <h1>{selectedCategory ? `${selectedCategory} products` : "Products"}</h1>
          <p className="section-copy">
            Clean product cards, clearer pricing, and stable loading states for slower API responses.
          </p>
        </div>
        <div className="catalog-intro__meta">
          <span>{filteredProducts.length} items</span>
          <span>Responsive grid</span>
        </div>
      </div>

      <div className="products-wakeup-note">
        Loading placeholders appear immediately while the backend wakes up, reducing blank states and layout shifts.
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <StatePanel
            title="No products found"
            description={
              selectedCategory
                ? `No products are available in ${selectedCategory} right now.`
                : "The catalog is currently empty."
            }
            actionLabel="Retry"
            onAction={refreshData}
            tone="empty"
            compact
          />
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))
        )}
      </div>
    </section>
  );
};

export default Products;
