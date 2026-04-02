import axios from "../axios";
import { useState, useEffect, createContext, useCallback } from "react";

const AppContext = createContext({
  data: [],
  isError: "",
  isLoading: true,
  hasLoadedData: false,
  featuredProducts: [],
  isFeaturedLoading: false,
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData:() =>{},
  loadFeaturedProducts: () => {},
  updateStockQuantity: (productId, newQuantity) =>{}
  
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(false);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);


  const addToCart = (product) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex !== -1) {
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } else {
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (productId) => {
    console.log("productID",productId)
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    console.log("CART",cart)
  };

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setIsError("");
    try {
      const response = await axios.get("/products");
      setData(response.data);
      setHasLoadedData(true);
    } catch (error) {
      setIsError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFeaturedProducts = useCallback(async () => {
    if (featuredProducts.length > 0 || isFeaturedLoading) {
      return;
    }

    setIsFeaturedLoading(true);
    try {
      const sourceProducts = data.length > 0 ? data : (await axios.get("/products")).data;
      setFeaturedProducts(sourceProducts.slice(0, 2));
      if (sourceProducts.length > 0 && !hasLoadedData) {
        setData(sourceProducts);
        setHasLoadedData(true);
        setIsLoading(false);
      }
    } catch (error) {
      setIsError(error.message);
    } finally {
      setIsFeaturedLoading(false);
    }
  }, [data, featuredProducts.length, hasLoadedData, isFeaturedLoading]);

  const clearCart =() =>{
    setCart([]);
  }
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return (
    <AppContext.Provider value={{ data, isError, isLoading, hasLoadedData, featuredProducts, isFeaturedLoading, cart, addToCart, removeFromCart,refreshData, loadFeaturedProducts, clearCart  }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
