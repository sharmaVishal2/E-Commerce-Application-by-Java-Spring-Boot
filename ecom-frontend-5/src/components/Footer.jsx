import { Link } from "react-router-dom";

const Footer = ({ categories = [] }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="storefront-shell site-footer__grid">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">Vishal Store</Link>
          <p>A considered storefront for useful technology, everyday essentials, and things worth keeping.</p>
          <a href="mailto:sharmavishal2@gmail.com">sharmavishal2@gmail.com</a>
        </div>
        <div>
          <h2>Explore</h2>
          <Link to="/">Home</Link>
          <Link to="/products">Shop all</Link>
          <Link to="/cart">Shopping bag</Link>
          <Link to="/login">Account</Link>
        </div>
        <div>
          <h2>Categories</h2>
          {categories.slice(0, 5).map((category) => (
            <Link key={category} to={`/products?category=${encodeURIComponent(category)}`}>{category}</Link>
          ))}
        </div>
        <div className="site-footer__contact">
          <h2>Stay in the loop</h2>
          <p>Questions about a product or your order? Visit the project source to connect with the developer.</p>
          <a className="button button--secondary" href="https://github.com/sharmaVishal2/E-Commerce-Application-by-Java-Spring-Boot" target="_blank" rel="noreferrer">Contact via GitHub</a>
        </div>
      </div>
      <div className="storefront-shell site-footer__bottom">
        <span>© {currentYear} Vishal Store</span>
        <a href="https://github.com/sharmaVishal2/E-Commerce-Application-by-Java-Spring-Boot" target="_blank" rel="noreferrer">View source on GitHub</a>
      </div>
    </footer>
  );
};

export default Footer;
