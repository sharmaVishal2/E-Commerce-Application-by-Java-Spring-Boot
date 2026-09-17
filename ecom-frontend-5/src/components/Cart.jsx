import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppContext from "../Context/Context";
import axios from "../axios";
import CheckoutPopup from "./CheckoutPopup";
import unplugged from "../assets/unplugged.png";

const Cart = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!cart.length) { setCartItems([]); return; }
    let mounted = true;
    (async () => {
      const items = await Promise.all(
        cart.map(async (item) => {
          if (item.imageUrl || !item.imageName) return { ...item, imageUrl: item.imageUrl || unplugged };
          try {
            const res = await axios.get(`/product/${item.id}/image`, { skipAuth: true, responseType: "blob" });
            const imageFile = new File([res.data], item.imageName, { type: res.data.type });
            return { ...item, imageUrl: URL.createObjectURL(res.data), imageFile };
          } catch { return { ...item, imageUrl: unplugged }; }
        })
      );
      if (mounted) setCartItems(items);
    })();
    return () => { mounted = false; };
  }, [cart]);

  useEffect(() => {
    setTotalPrice(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [cartItems]);

  const increase = (id) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.quantity >= item.stockQuantity) { alert("Cannot exceed available stock"); return item; }
        const next = item.quantity + 1;
        updateCartQuantity(id, next);
        return { ...item, quantity: next };
      })
    );
  };

  const decrease = (id) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const next = Math.max(1, item.quantity - 1);
        updateCartQuantity(id, next);
        return { ...item, quantity: next };
      })
    );
  };

  const remove = (id) => {
    removeFromCart(id);
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        if (item.source === "static") continue;
        const updatedData = { ...item, stockQuantity: item.stockQuantity - item.quantity };
        ["imageUrl", "imageName", "imageData", "imageType", "quantity"].forEach((f) => delete updatedData[f]);
        const form = new FormData();
        if (item.imageFile) form.append("imageFile", item.imageFile);
        form.append("product", new Blob([JSON.stringify(updatedData)], { type: "application/json" }));
        await axios.put(`/product/${item.id}`, form);
      }
      clearCart();
      setCartItems([]);
      setShowModal(false);
    } catch { console.error("Checkout error"); }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page">
        <div className="shell cart-page">
          <h1>Shopping Cart</h1>
          <div className="cart-empty">
            <span className="cart-empty__icon" aria-hidden="true">🛍</span>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started.</p>
            <Link to="/products" className="btn btn--primary">Browse products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="shell cart-page">
        <h1>Shopping Cart</h1>
        <div className="cart-layout">
          <div>
            <ul className="cart-items-list" style={{ listStyle: "none", padding: 0 }}>
              {cartItems.map((item) => (
                <li key={item.id} className="cart-item">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="cart-item__img"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = unplugged; }}
                  />
                  <div className="cart-item__info">
                    <p className="cart-item__brand">{item.brand}</p>
                    <p className="cart-item__name">{item.name}</p>
                  </div>
                  <div className="cart-item__qty" aria-label="Quantity">
                    <button className="cart-qty-btn" type="button" aria-label="Decrease" onClick={() => decrease(item.id)}>−</button>
                    <span className="cart-qty-val">{item.quantity}</span>
                    <button className="cart-qty-btn" type="button" aria-label="Increase" onClick={() => increase(item.id)}>+</button>
                  </div>
                  <span className="cart-item__price">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    className="cart-item__remove"
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => remove(item.id)}
                  >
                    <i className="bi bi-trash" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row">
              <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="cart-summary-row cart-summary-row--total">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              className="btn btn--primary btn--full"
              type="button"
              onClick={() => setShowModal(true)}
            >
              Proceed to Checkout
            </button>
            <Link to="/products" className="btn btn--ghost btn--full" style={{ textAlign: "center" }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <CheckoutPopup
        show={showModal}
        handleClose={() => setShowModal(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        handleCheckout={handleCheckout}
      />
    </div>
  );
};

export default Cart;
