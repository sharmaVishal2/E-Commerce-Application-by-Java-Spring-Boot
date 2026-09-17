import { Link, useNavigate } from "react-router-dom";

const CATEGORIES = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-brand__logo">
              Vishal<span>Store</span>
            </Link>
            <p>
              A full-featured e-commerce backend built with Java Spring Boot,
              with a clean React storefront for browsing, carting, and ordering.
            </p>
            <a
              href="https://github.com/sharmaVishal2/E-Commerce-Application-by-Java-Spring-Boot"
              target="_blank"
              rel="noreferrer"
              className="btn btn--ghost btn--sm"
              style={{ width: "fit-content" }}
            >
              <i className="bi bi-github" /> View on GitHub
            </a>
          </div>

          <div className="footer-col">
            <h4>Shop</h4>
            <Link to="/products">All Products</Link>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat)}`)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/cart">Shopping Cart</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6 }}>
              Need help? Contact the developer via GitHub.
            </p>
            <a
              href="https://github.com/sharmaVishal2"
              target="_blank"
              rel="noreferrer"
            >
              @sharmaVishal2
            </a>
            <a
              href="https://sharmavishal2.github.io/Portfolio/"
              target="_blank"
              rel="noreferrer"
            >
              Portfolio
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} VishalStore. Built with Spring Boot &amp; React.</span>
          <a
            href="https://github.com/sharmaVishal2/E-Commerce-Application-by-Java-Spring-Boot"
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
