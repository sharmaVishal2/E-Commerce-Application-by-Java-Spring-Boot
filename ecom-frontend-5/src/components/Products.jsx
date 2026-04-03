import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axios";
import AppContext from "../Context/Context";
import unplugged from "../assets/unplugged.png";

const Products = ({ selectedCategory }) => {
  const { data, isError, isLoading, addToCart } = useContext(AppContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setProducts([]);
      return;
    }

    setProducts(
      data.map((product) => ({ ...product, imageUrl: unplugged }))
    );

    let isMounted = true;
    const objectUrls = [];

    const fetchImagesAndUpdateProducts = async () => {
      const updatedProducts = await Promise.all(
        data.map(async (product) => {
          if (!product.imageName) {
            return { ...product, imageUrl: unplugged };
          }

          try {
            const response = await axios.get(`/product/${product.id}/image`, {
              skipAuth: true,
              responseType: "blob",
            });
            const imageUrl = URL.createObjectURL(response.data);
            objectUrls.push(imageUrl);
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
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [data]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  if (isError) {
    return (
      <div className="home-status">
        <img src={unplugged} alt="Error" style={{ width: "100px", height: "100px" }} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="home-status">
        <h2 className="text-center">Loading products...</h2>
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{
        marginTop: "64px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {filteredProducts.length === 0 ? (
        <div className="home-status home-status-inline">
          <h2 className="text-center">No Products Available</h2>
        </div>
      ) : (
        filteredProducts.map((product) => {
          const { id, brand, name, price, productAvailable, imageUrl } = product;
          return (
            <div
              className="card mb-3"
              style={{
                width: "250px",
                height: "360px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                overflow: "hidden",
                backgroundColor: productAvailable ? "#fff" : "#ccc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "stretch",
              }}
              key={id}
            >
              <Link
                to={`/product/${id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <img
                  src={imageUrl}
                  alt={name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = unplugged;
                  }}
                  style={{
                    width: "100%",
                    height: "150px",
                    objectFit: "cover",
                    padding: "5px",
                    margin: "0",
                    borderRadius: "10px",
                  }}
                />
                <div
                  className="card-body"
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "10px",
                  }}
                >
                  <div>
                    <h5
                      className="card-title"
                      style={{ margin: "0 0 10px 0", fontSize: "1.2rem" }}
                    >
                      {name.toUpperCase()}
                    </h5>
                    <i
                      className="card-brand"
                      style={{ fontStyle: "italic", fontSize: "0.8rem" }}
                    >
                      {"~ " + brand}
                    </i>
                  </div>
                  <hr className="hr-line" style={{ margin: "10px 0" }} />
                  <div className="home-cart-price">
                    <h5
                      className="card-text"
                      style={{
                        fontWeight: "600",
                        fontSize: "1.1rem",
                        marginBottom: "5px",
                      }}
                    >
                      ${price}
                    </h5>
                  </div>
                  <button
                    className="btn-hover color-9"
                    style={{ margin: "10px 25px 0px " }}
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product);
                    }}
                    disabled={!productAvailable}
                  >
                    {productAvailable ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </Link>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Products;
