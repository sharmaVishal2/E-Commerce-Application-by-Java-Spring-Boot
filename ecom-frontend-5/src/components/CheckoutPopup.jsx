import unplugged from "../assets/unplugged.png";

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, handleCheckout }) => {
  if (!show) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h3 id="checkout-title">Order Review</h3>
          <button className="modal-close" type="button" aria-label="Close" onClick={handleClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="modal-body">
          {cartItems.map((item) => (
            <div key={item.id} className="modal-item">
              <img
                src={item.imageUrl || unplugged}
                alt={item.name}
                className="modal-item__img"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = unplugged; }}
              />
              <div className="modal-item__info">
                <p className="modal-item__name">{item.name}</p>
                <p className="modal-item__qty">Qty: {item.quantity}</p>
              </div>
              <span className="modal-item__price">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="modal-total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn--secondary btn--full" type="button" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn--primary btn--full" type="button" onClick={handleCheckout}>
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPopup;
