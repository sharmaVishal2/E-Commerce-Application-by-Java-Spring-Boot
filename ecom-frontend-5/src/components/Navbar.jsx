import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axios";
import AuthContext from "../Context/AuthContext";
import AppContext from "../Context/Context";
import { searchStaticProducts } from "../data/staticProducts";

const CATEGORIES = ["Laptop", "Headphone", "Mobile", "Electronics", "Toys", "Fashion"];

const getInitialTheme = () => {
  const stored = localStorage.getItem("theme");
  if (stored) return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark-theme" : "light-theme";
};

const Navbar = ({ onSelectCategory }) => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const { cart } = useContext(AppContext);
  const [theme, setTheme] = useState(getInitialTheme);
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const catRef = useRef(null);
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
      if (catRef.current && !catRef.current.contains(e.target)) {
        setShowCategories(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (input.length < 1) {
      setShowResults(false);
      setSearchResults([]);
      setNoResults(false);
      return;
    }
    const id = setTimeout(async () => {
      setShowResults(true);
      try {
        const res = await axios.get(`/products/search?keyword=${input}`, { skipAuth: true });
        const api = Array.isArray(res.data) ? res.data : [];
        const results = api.length > 0 ? api : searchStaticProducts(input);
        setSearchResults(results.slice(0, 6));
        setNoResults(results.length === 0);
      } catch {
        const results = searchStaticProducts(input);
        setSearchResults(results.slice(0, 6));
        setNoResults(results.length === 0);
      }
    }, 320);
    return () => clearTimeout(id);
  }, [input]);

  const toggleTheme = () => {
    const next = theme === "dark-theme" ? "light-theme" : "dark-theme";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  const handleCategorySelect = (cat) => {
    onSelectCategory(cat);
    navigate(`/products?category=${encodeURIComponent(cat)}`);
    setShowCategories(false);
    setMobileOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) navigate(`/products?search=${encodeURIComponent(input.trim())}`);
    else navigate("/products");
    setShowResults(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <header>
      <nav className={`nav-root${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-brand">
            Vishal<span>Store</span>
          </Link>

          <ul className="nav-links">
            <li>
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li>
              <Link to="/products" className="nav-link">Shop</Link>
            </li>
            <li ref={catRef} className="nav-categories-dropdown">
              <button
                className="nav-link"
                onClick={() => setShowCategories((v) => !v)}
                aria-expanded={showCategories}
                aria-haspopup="true"
              >
                Categories
                <i className="bi bi-chevron-down" style={{ fontSize: "0.7rem" }} />
              </button>
              {showCategories && (
                <div className="nav-dropdown-menu" role="menu">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className="nav-dropdown-item"
                      role="menuitem"
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>

          <div className="nav-actions">
            <div ref={searchRef} className="nav-search-wrap">
              <form onSubmit={handleSearchSubmit}>
                <i className="bi bi-search nav-search-icon" aria-hidden="true" />
                <input
                  className="nav-search-input"
                  type="search"
                  placeholder="Search products…"
                  aria-label="Search products"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => input.length > 0 && setShowResults(true)}
                />
              </form>
              {showResults && (
                <div className="nav-search-results" role="listbox">
                  {searchResults.length > 0
                    ? searchResults.map((r) => (
                        <Link
                          key={r.id}
                          to={`/product/${r.id}`}
                          className="nav-search-result-item"
                          role="option"
                          onClick={() => { setShowResults(false); setInput(""); }}
                        >
                          {r.name}
                        </Link>
                      ))
                    : noResults && (
                        <p className="nav-search-no-results">No products found</p>
                      )}
                </div>
              )}
            </div>

            <button
              className="nav-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark-theme" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <i className={`bi ${theme === "dark-theme" ? "bi-sun-fill" : "bi-moon-fill"}`} />
            </button>

            <Link to="/cart" className="nav-icon-btn" aria-label={`Cart, ${cartCount} items`}>
              <i className="bi bi-bag" />
              {cartCount > 0 && (
                <span className="nav-cart-badge" aria-hidden="true">{cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <span className="nav-user-chip" title={user?.username}>
                  <i className="bi bi-person-fill" />
                  {user?.username}
                </span>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn--primary btn--sm">Sign in</Link>
            )}

            <button
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"}`} />
            </button>
          </div>
        </div>

        <div className={`nav-mobile-menu${mobileOpen ? " open" : ""}`} aria-hidden={!mobileOpen}>
          <form onSubmit={handleSearchSubmit}>
            <input
              className="nav-mobile-search"
              type="search"
              placeholder="Search products…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </form>
          <Link to="/" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            <i className="bi bi-house" /> Home
          </Link>
          <Link to="/products" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            <i className="bi bi-grid" /> Shop
          </Link>
          {CATEGORIES.map((cat) => (
            <button key={cat} className="nav-mobile-link" onClick={() => handleCategorySelect(cat)}>
              <i className="bi bi-tag" /> {cat}
            </button>
          ))}
          <Link to="/cart" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
            <i className="bi bi-bag" /> Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          {isAuthenticated ? (
            <>
              {user?.roles?.includes("ROLE_ADMIN") && (
                <Link to="/add_product" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                  <i className="bi bi-plus-circle" /> Add Product
                </Link>
              )}
              <button className="nav-mobile-link" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                <i className="bi bi-person" /> Sign in
              </Link>
              <Link to="/register" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>
                <i className="bi bi-person-plus" /> Register
              </Link>
            </>
          )}
          <button className="nav-mobile-link" onClick={toggleTheme}>
            <i className={`bi ${theme === "dark-theme" ? "bi-sun-fill" : "bi-moon-fill"}`} />
            {theme === "dark-theme" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
