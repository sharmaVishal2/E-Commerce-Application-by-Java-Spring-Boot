import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";
import { getCachedImageUrl, setCachedImageUrl } from "../utils/imageCache";
import ProductCard from "./ui/ProductCard";
import ProductGridSkeleton from "./ui/ProductGridSkeleton";
import StatePanel from "./ui/StatePanel";

const resolveInitialImage = (p) => p.imageUrl || unplugged;

const Products = ({ selectedCategory }) => {
  const { data, isError, isLoading, addToCart, refreshData } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search")?.trim().toLowerCase() || "";
  const categoryFromUrl = searchParams.get("category") || "";
  const activeCategory = categoryFromUrl || selectedCategory || "";
  const sortOrder = searchParams.get("sort") || "relevance";
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!data?.length) { setProducts([]); return; }
    setProducts(data.map((p) => ({ ...p, imageUrl: resolveInitialImage(p) })));
    let mounted = true;
    (async () => {
      const updated = await Promise.all(
        data.map(async (p) => {
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
      if (mounted) setProducts(updated);
    })();
    return () => { mounted = false; };
  }, [data]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchesCat = !activeCategory || p.category === activeCategory;
      const searchable = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
      return matchesCat && (!searchTerm || searchable.includes(searchTerm));
    });
    return [...filtered].sort((a, b) => {
      if (sortOrder === "price-low") return Number(a.price) - Number(b.price);
      if (sortOrder === "price-high") return Number(b.price) - Number(a.price);
      if (sortOrder === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, searchTerm, activeCategory, sortOrder]);

  const clearFilters = () => setSearchParams(new URLSearchParams());

  const pageTitle = searchTerm
    ? `Results for "${searchTerm}"`
    : activeCategory
    ? `${activeCategory}`
    : "All Products";

  return (
    <div className="page">
      <div className="shell products-page">
        <div className="catalog-header">
          <div>
            <p className="section-eyebrow">Catalog</p>
            <h1>{pageTitle}</h1>
          </div>
          <div className="catalog-meta">
            {!isLoading && (
              <span className="catalog-count">{filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""}</span>
            )}
            {(searchTerm || activeCategory) && (
              <button className="btn btn--ghost btn--sm" onClick={clearFilters}>
                <i className="bi bi-x" /> Clear filters
              </button>
            )}
            <select
              className="catalog-sort"
              value={sortOrder}
              aria-label="Sort products"
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value === "relevance") next.delete("sort");
                else next.set("sort", e.target.value);
                setSearchParams(next);
              }}
            >
              <option value="relevance">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {isError ? (
          <StatePanel
            title="Couldn't load the catalog"
            description="The API request failed. The backend may still be waking up — retry in a moment."
            actionLabel="Retry"
            onAction={refreshData}
            tone="error"
          />
        ) : isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <StatePanel
            title="No products found"
            description={
              searchTerm
                ? `No products match "${searchTerm}". Try a different search.`
                : activeCategory
                ? `No products in ${activeCategory} right now.`
                : "The catalog is currently empty."
            }
            actionLabel={searchTerm || activeCategory ? "Browse all products" : "Retry"}
            onAction={() => { clearFilters(); if (!searchTerm && !activeCategory) refreshData(); }}
            tone="empty"
          />
        ) : (
          <div className="products-grid">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
