import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "./firebase";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);

  // -----------------------------
  // DASHBOARD / SIDEBAR
  // -----------------------------
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  // -----------------------------
  // PRODUCT SEARCH
  // -----------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");

  // -----------------------------
  // CART
  // -----------------------------
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("shopease-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [message, setMessage] = useState("");

  // -----------------------------
  // ADMIN FORM
  // -----------------------------
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // -----------------------------
  // CONTACT FORM
  // -----------------------------
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // -----------------------------
  // FEEDBACK FORM
  // -----------------------------
  const [feedbackName, setFeedbackName] = useState("");
  const [rating, setRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // -----------------------------
  // FETCH PRODUCTS
  // -----------------------------
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "products")
      );

      const productList = querySnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // -----------------------------
  // SAVE CART
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(
      "shopease-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // -----------------------------
  // NAVIGATION
  // -----------------------------
  const navigateTo = (page) => {
    setActivePage(page);
    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------
  // ADD TO CART
  // -----------------------------
  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.id === product.id
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    setMessage(`${product.name} added to cart!`);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  // -----------------------------
  // INCREASE QUANTITY
  // -----------------------------
  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // -----------------------------
  // DECREASE QUANTITY
  // -----------------------------
  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // -----------------------------
  // REMOVE FROM CART
  // -----------------------------
  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // -----------------------------
  // CART TOTAL
  // -----------------------------
  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // -----------------------------
  // CATEGORIES
  // -----------------------------
  const categories = [
    "All Products",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // -----------------------------
  // FILTER PRODUCTS
  // -----------------------------
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All Products" ||
      product.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  // -----------------------------
  // ADD PRODUCT
  // -----------------------------
  const addProduct = async (e) => {
    e.preventDefault();

    if (!name || !price || !category) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        category,
        description,
        image,
      });

      alert("Product added successfully!");

      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImage("");

      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  // -----------------------------
  // DELETE PRODUCT
  // -----------------------------
  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );

      setCart((currentCart) =>
        currentCart.filter((item) => item.id !== id)
      );

      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  // -----------------------------
  // CONTACT FORM
  // -----------------------------
  const submitContact = async (e) => {
    e.preventDefault();

    if (
      !contactName ||
      !contactEmail ||
      !contactSubject ||
      !contactMessage
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "contactMessages"), {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        createdAt: new Date().toISOString(),
      });

      alert(
        "Thank you for contacting ShopEase. We will get back to you soon!"
      );

      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Failed to send your message. Please try again.");
    }
  };

  // -----------------------------
  // FEEDBACK FORM
  // -----------------------------
  const submitFeedback = async (e) => {
    e.preventDefault();

    if (!feedbackName || !feedbackMessage) {
      alert("Please enter your name and feedback.");
      return;
    }

    try {
      await addDoc(collection(db, "feedback"), {
        name: feedbackName,
        rating: Number(rating),
        message: feedbackMessage,
        createdAt: new Date().toISOString(),
      });

      alert("Thank you for your valuable feedback!");

      setFeedbackName("");
      setRating(5);
      setFeedbackMessage("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  // -----------------------------
  // PAGE TITLE
  // -----------------------------
  const getPageTitle = () => {
    switch (activePage) {
      case "home":
        return "Dashboard";
      case "products":
        return "Products";
      case "cart":
        return "Shopping Cart";
      case "contact":
        return "Contact Us";
      case "feedback":
        return "Customer Feedback";
      case "admin":
        return "Admin Panel";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="app">

      {/* ============================= */}
      {/* SIDEBAR */}
      {/* ============================= */}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-header">
          <div className="logo-icon">S</div>
          <h2>ShopEase</h2>
        </div>

        <div className="sidebar-menu">

          <button
            className={
              activePage === "home"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => navigateTo("home")}
          >
            <span>⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            className={
              activePage === "products"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => navigateTo("products")}
          >
            <span>▣</span>
            <span>Products</span>
          </button>

          <button
            className={
              activePage === "cart"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => navigateTo("cart")}
          >
            <span>🛒</span>
            <span>Cart</span>

            {cartItemCount > 0 && (
              <span className="sidebar-badge">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            className={
              activePage === "contact"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => navigateTo("contact")}
          >
            <span>✉</span>
            <span>Contact Us</span>
          </button>

          <button
            className={
              activePage === "feedback"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => navigateTo("feedback")}
          >
            <span>★</span>
            <span>Customer Feedback</span>
          </button>

          <div className="menu-divider"></div>

          <button
            className={
              activePage === "admin"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() => navigateTo("admin")}
          >
            <span>⚙</span>
            <span>Admin Panel</span>
          </button>

        </div>

        <div className="sidebar-bottom">
          <p>ShopEase</p>
          <small>Smart Shopping Experience</small>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ============================= */}
      {/* MAIN CONTENT */}
      {/* ============================= */}

      <main className="main-content">

        {/* TOP BAR */}

        <header className="topbar">

          <button
            className="hamburger"
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="page-heading">
            <h1>{getPageTitle()}</h1>
            <p>
              Welcome to your ShopEase dashboard
            </p>
          </div>

          <div className="topbar-cart">
            <button
              onClick={() => navigateTo("cart")}
            >
              🛒
              {cartItemCount > 0 && (
                <span>{cartItemCount}</span>
              )}
            </button>
          </div>

        </header>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="cart-message">
            ✓ {message}
          </div>
        )}

        {/* ============================= */}
        {/* HOME */}
        {/* ============================= */}

        {activePage === "home" && (
          <section className="page home-page">

            <div className="welcome-card">

              <div className="welcome-content">

                <p className="welcome-label">
                  WELCOME TO SHOPEASE
                </p>

                <h2>
                  Shop smarter.
                  <br />
                  Live better.
                </h2>

                <p>
                  Discover quality products at great
                  prices with a simple and convenient
                  shopping experience.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    navigateTo("products")
                  }
                >
                  Explore Products →
                </button>

              </div>

              <div className="welcome-decoration">
                <div className="decoration-circle">
                  🛍
                </div>
              </div>

            </div>

            {/* ABOUT US */}

            <div className="about-section">

              <div className="section-heading">
                <p>ABOUT US</p>
                <h2>Making shopping simple</h2>
              </div>

              <div className="about-grid">

                <div className="about-card">
                  <div className="about-icon">
                    ✓
                  </div>

                  <h3>Quality Products</h3>

                  <p>
                    We aim to provide carefully
                    selected products that deliver
                    great value and quality.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-icon">
                    ₹
                  </div>

                  <h3>Great Value</h3>

                  <p>
                    ShopEase focuses on offering
                    competitive prices while keeping
                    your shopping experience simple.
                  </p>
                </div>

                <div className="about-card">
                  <div className="about-icon">
                    ♡
                  </div>

                  <h3>Customer First</h3>

                  <p>
                    Your feedback matters to us.
                    We continuously work to improve
                    our service for our customers.
                  </p>
                </div>

              </div>

            </div>

          </section>
        )}

        {/* ============================= */}
        {/* PRODUCTS */}
        {/* ============================= */}

        {activePage === "products" && (
          <section className="page">

            <div className="section-heading">
              <p>SHOP</p>
              <h2>Our Products</h2>
            </div>

            {/* SEARCH AREA */}

            <div className="product-toolbar">

              <div className="search-box">

                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search by product or category..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                  >
                    ×
                  </button>
                )}

              </div>

              <div className="category-filter">

                <label>Category</label>

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value)
                  }
                >
                  {categories.map((cat) => (
                    <option
                      value={cat}
                      key={cat}
                    >
                      {cat}
                    </option>
                  ))}
                </select>

              </div>

            </div>

            <div className="product-result-info">
              Showing{" "}
              <strong>
                {filteredProducts.length}
              </strong>{" "}
              product
              {filteredProducts.length !== 1
                ? "s"
                : ""}
            </div>

            {/* PRODUCTS */}

            <div className="products">

              {filteredProducts.length === 0 ? (
                <div className="no-products">

                  <div>⌕</div>

                  <h3>No products found</h3>

                  <p>
                    Try changing your search or
                    category filter.
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(
                        "All Products"
                      );
                    }}
                  >
                    View All Products
                  </button>

                </div>
              ) : (
                filteredProducts.map((product) => (

                  <div
                    className="product-card"
                    key={product.id}
                  >

                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                    ) : (
                      <div className="product-placeholder">
                        🛍
                      </div>
                    )}

                    <div className="product-card-body">

                      <span className="category">
                        {product.category}
                      </span>

                      <h3>{product.name}</h3>

                      <p className="product-description">
                        {product.description ||
                          "Quality product from ShopEase."}
                      </p>

                      <div className="product-bottom">

                        <h3>
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </h3>

                        <button
                          className="buy-btn"
                          onClick={() =>
                            addToCart(product)
                          }
                        >
                          + Add
                        </button>

                      </div>

                    </div>

                  </div>

                ))
              )}

            </div>

          </section>
        )}

        {/* ============================= */}
        {/* CART */}
        {/* ============================= */}

        {activePage === "cart" && (
          <section className="page">

            <div className="section-heading">
              <p>SHOPPING</p>
              <h2>Your Cart</h2>
            </div>

            {cart.length === 0 ? (

              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>Your cart is empty</h3>

                <p>
                  Add some products to your cart
                  and they will appear here.
                </p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    navigateTo("products")
                  }
                >
                  Continue Shopping
                </button>

              </div>

            ) : (

              <div className="cart-container">

                <div className="cart-items">

                  {cart.map((item) => (

                    <div
                      className="cart-item"
                      key={item.id}
                    >

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <div className="cart-placeholder">
                          🛍
                        </div>
                      )}

                      <div className="cart-item-info">

                        <span className="category">
                          {item.category}
                        </span>

                        <h3>{item.name}</h3>

                        <p>
                          ₹
                          {Number(
                            item.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <div className="quantity-controls">

                          <button
                            onClick={() =>
                              decreaseQuantity(
                                item.id
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(
                                item.id
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                        <button
                          className="remove-btn"
                          onClick={() =>
                            removeFromCart(
                              item.id
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>

                      <strong className="item-total">
                        ₹
                        {(
                          Number(item.price) *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  ))}

                </div>

                <div className="cart-summary">

                  <h3>Order Summary</h3>

                  <div className="summary-row">
                    <span>Items</span>
                    <span>
                      {cartItemCount}
                    </span>
                  </div>

                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>
                      ₹
                      {cartTotal.toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>

                  <div className="summary-row">
                    <span>Delivery</span>
                    <span>Free</span>
                  </div>

                  <div className="summary-line"></div>

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>
                      ₹
                      {cartTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() =>
                      alert(
                        "Checkout feature coming soon!"
                      )
                    }
                  >
                    Proceed to Checkout
                  </button>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ============================= */}
        {/* CONTACT */}
        {/* ============================= */}

        {activePage === "contact" && (
          <section className="page">

            <div className="section-heading">
              <p>GET IN TOUCH</p>
              <h2>Contact Us</h2>

              <span>
                Have a question or need assistance?
                We'd love to hear from you.
              </span>
            </div>

            <div className="contact-layout">

              <div className="contact-info">

                <div className="contact-info-header">
                  <h3>Let's talk</h3>
                  <p>
                    Our team is here to help you with
                    your shopping experience.
                  </p>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon">
                    ✉
                  </div>

                  <div>
                    <small>Email</small>
                    <strong>
                      support@shopease.com
                    </strong>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon">
                    ☎
                  </div>

                  <div>
                    <small>Phone</small>
                    <strong>
                      +91 98765 43210
                    </strong>
                  </div>
                </div>

                <div className="contact-detail">
                  <div className="contact-icon">
                    ⌖
                  </div>

                  <div>
                    <small>Location</small>
                    <strong>
                      Maharashtra, India
                    </strong>
                  </div>
                </div>

              </div>

              <form
                className="contact-form"
                onSubmit={submitContact}
              >

                <div className="form-row">

                  <div className="form-group">
                    <label>Your Name</label>

                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={contactName}
                      onChange={(e) =>
                        setContactName(
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={contactEmail}
                      onChange={(e) =>
                        setContactEmail(
                          e.target.value
                        )
                      }
                    />
                  </div>

                </div>

                <div className="form-group">
                  <label>Subject</label>

                  <input
                    type="text"
                    placeholder="How can we help?"
                    value={contactSubject}
                    onChange={(e) =>
                      setContactSubject(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>

                  <textarea
                    placeholder="Write your message..."
                    rows="6"
                    value={contactMessage}
                    onChange={(e) =>
                      setContactMessage(
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Send Message →
                </button>

              </form>

            </div>

          </section>
        )}

        {/* ============================= */}
        {/* FEEDBACK */}
        {/* ============================= */}

        {activePage === "feedback" && (
          <section className="page">

            <div className="section-heading">
              <p>YOUR OPINION MATTERS</p>
              <h2>Customer Feedback</h2>

              <span>
                Tell us about your ShopEase
                experience.
              </span>
            </div>

            <div className="feedback-container">

              <div className="feedback-intro">

                <div className="feedback-large-icon">
                  ★
                </div>

                <h3>
                  Help us improve
                </h3>

                <p>
                  Your feedback helps us understand
                  what we're doing well and where we
                  can improve.
                </p>

                <div className="feedback-points">
                  <span>✓ Simple shopping</span>
                  <span>✓ Better products</span>
                  <span>✓ Better service</span>
                </div>

              </div>

              <form
                className="feedback-form"
                onSubmit={submitFeedback}
              >

                <div className="form-group">
                  <label>Your Name</label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={feedbackName}
                    onChange={(e) =>
                      setFeedbackName(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">

                  <label>
                    How would you rate us?
                  </label>

                  <div className="rating-selector">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          type="button"
                          key={star}
                          className={
                            star <= rating
                              ? "star selected"
                              : "star"
                          }
                          onClick={() =>
                            setRating(star)
                          }
                        >
                          ★
                        </button>
                      )
                    )}

                  </div>

                  <span className="rating-text">
                    {rating === 5
                      ? "Excellent"
                      : rating === 4
                      ? "Very Good"
                      : rating === 3
                      ? "Good"
                      : rating === 2
                      ? "Needs Improvement"
                      : "Poor"}
                  </span>

                </div>

                <div className="form-group">
                  <label>Your Feedback</label>

                  <textarea
                    rows="6"
                    placeholder="Share your experience with us..."
                    value={feedbackMessage}
                    onChange={(e) =>
                      setFeedbackMessage(
                        e.target.value
                      )
                    }
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Submit Feedback →
                </button>

              </form>

            </div>

          </section>
        )}

        {/* ============================= */}
        {/* ADMIN */}
        {/* ============================= */}

        {activePage === "admin" && (
          <section className="page">

            <div className="section-heading">
              <p>MANAGEMENT</p>
              <h2>Admin Panel</h2>

              <span>
                Add and manage products in your store.
              </span>
            </div>

            <div className="admin-layout">

              {/* ADD PRODUCT */}

              <div className="admin-card">

                <div className="admin-card-heading">
                  <div>
                    <h3>Add New Product</h3>
                    <p>
                      Enter the product information
                      below.
                    </p>
                  </div>
                </div>

                <form
                  className="product-form"
                  onSubmit={addProduct}
                >

                  <div className="form-group">
                    <label>
                      Product Name *
                    </label>

                    <input
                      type="text"
                      placeholder="Product name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                    />
                  </div>

                  <div className="form-row">

                    <div className="form-group">
                      <label>
                        Price *
                      </label>

                      <input
                        type="number"
                        placeholder="Price"
                        value={price}
                        onChange={(e) =>
                          setPrice(
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Category *
                      </label>

                      <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) =>
                          setCategory(
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                  <div className="form-group">
                    <label>
                      Image URL
                    </label>

                    <input
                      type="text"
                      placeholder="https://..."
                      value={image}
                      onChange={(e) =>
                        setImage(e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Description
                    </label>

                    <textarea
                      rows="4"
                      placeholder="Product description"
                      value={description}
                      onChange={(e) =>
                        setDescription(
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="primary-btn"
                  >
                    + Add Product
                  </button>

                </form>

              </div>

              {/* MANAGE PRODUCTS */}

              <div className="admin-card">

                <div className="admin-card-heading">
                  <div>
                    <h3>Manage Products</h3>
                    <p>
                      {products.length} products
                      currently listed.
                    </p>
                  </div>
                </div>

                <div className="admin-products">

                  {products.length === 0 ? (
                    <p className="admin-empty">
                      No products available.
                    </p>
                  ) : (
                    products.map((product) => (

                      <div
                        className="admin-product"
                        key={product.id}
                      >

                        <div className="admin-product-info">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="admin-product-placeholder">
                              🛍
                            </div>
                          )}

                          <div>
                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              {product.category}
                              {" • "}
                              ₹
                              {Number(
                                product.price
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </small>
                          </div>

                        </div>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteProduct(
                              product.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    ))
                  )}

                </div>

              </div>

            </div>

          </section>
        )}

        {/* FOOTER */}

        <footer>
          <p>© 2026 ShopEase. All rights reserved.</p>

          <div>
            <button
              onClick={() =>
                navigateTo("contact")
              }
            >
              Contact
            </button>

            <button
              onClick={() =>
                navigateTo("feedback")
              }
            >
              Feedback
            </button>
          </div>
        </footer>

      </main>

    </div>
  );
}

export default App;