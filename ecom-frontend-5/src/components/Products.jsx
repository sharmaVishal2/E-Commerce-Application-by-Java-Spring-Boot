import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search")?.trim().toLowerCase() || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const activeCategory = categoryFromUrl || selectedCategory || "";
  const sortOrder = searchParams.get("sort") || "relevance";
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

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = !activeCategory || product.category === activeCategory;
      const searchable = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
      return matchesCategory && (!searchTerm || searchable.includes(searchTerm));
    });

    return [...filtered].sort((left, right) => {
      if (sortOrder === "price-low") return Number(left.price) - Number(right.price);
      if (sortOrder === "price-high") return Number(right.price) - Number(left.price);
      if (sortOrder === "name") return left.name.localeCompare(right.name);
      return 0;
    });
  }, [products, searchTerm, activeCategory, sortOrder]);

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
            <h1>{searchTerm ? `Results for "${searchTerm}"` : activeCategory ? `${activeCategory} products` : "Products"}</h1>
          <p className="section-copy">
            Clean product cards, clearer pricing, and stable loading states for slower API responses.
          </p>
        </div>
        <div className="catalog-intro__meta">
          <span>{filteredProducts.length} items</span>
          <label className="catalog-sort">
            <span className="visually-hidden">Sort products</span>
            <select
              className="form-select form-select-sm"
              value={sortOrder}
              onChange={(event) => {
                const nextParams = new URLSearchParams(searchParams);
                if (event.target.value === "relevance") nextParams.delete("sort");
                else nextParams.set("sort", event.target.value);
                setSearchParams(nextParams);
              }}
            >
              <option value="relevance">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
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
              searchTerm
                ? `No products match “${searchTerm}”. Try another search.`
                : activeCategory
                ? `No products are available in ${activeCategory} right now.`
                : "The catalog is currently empty."
            }
            actionLabel={searchTerm || activeCategory ? "Browse all products" : "Retry"}
            onAction={() => {
              if (searchTerm || activeCategory) setSearchParams(new URLSearchParams());
              refreshData();
            }}
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
