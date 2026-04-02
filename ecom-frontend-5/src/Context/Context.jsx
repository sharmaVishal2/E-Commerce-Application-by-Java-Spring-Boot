import axios from "../axios";
import { useState, useEffect, createContext, useCallback } from "react";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const AppContext = createContext({
  data: [],
  isError: "",
  isLoading: true,
  hasLoadedData: false,
  cart: [],
  addToCart: (product) => {},
  removeFromCart: (productId) => {},
  refreshData:() =>{},
  updateStockQuantity: (productId, newQuantity) =>{}
  
});

export const AppProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);
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
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await axios.get("/products");
        setData(response.data);
        setHasLoadedData(true);
        setIsLoading(false);
        return;
      } catch (error) {
        if (attempt === 2) {
          setIsError(error.message);
          setIsLoading(false);
          return;
        }

        await wait(1200 * (attempt + 1));
      }
    }
  }, []);

  const clearCart =() =>{
    setCart([]);
  }

  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
  
  return (
    <AppContext.Provider value={{ data, isError, isLoading, hasLoadedData, cart, addToCart, removeFromCart,refreshData, clearCart  }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
