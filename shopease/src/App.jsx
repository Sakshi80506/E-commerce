import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);

  // -----------------------------
  // CART STATE
  // -----------------------------
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("shopease-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [message, setMessage] = useState("");

  // -----------------------------
  // ADMIN PRODUCT FORM STATES
  // -----------------------------
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // -----------------------------
  // CONTACT FORM STATES
  // -----------------------------
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // -----------------------------
  // FEEDBACK FORM STATES
  // -----------------------------
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // -----------------------------
  // FETCH PRODUCTS FROM FIREBASE
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
  // SAVE CART TO LOCAL STORAGE
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(
      "shopease-cart",
      JSON.stringify(cart)
    );
  }, [cart]);

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
  // ADD PRODUCT - ADMIN
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
        createdAt: serverTimestamp(),
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

      // Also remove deleted product from cart
      setCart((currentCart) =>
        currentCart.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // -----------------------------
  // CONTACT US FORM
  // -----------------------------
  const submitContactForm = async (e) => {
    e.preventDefault();

    if (
      !contactName ||
      !contactEmail ||
      !contactSubject ||
      !contactMessage
    ) {
      alert("Please fill in all contact form fields.");
      return;
    }

    try {
      await addDoc(collection(db, "contacts"), {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage,
        createdAt: serverTimestamp(),
      });

      alert(
        "Thank you for contacting ShopEase! We will get back to you soon."
      );

      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Unable to send your message. Please try again.");
    }
  };

  // -----------------------------
  // CUSTOMER FEEDBACK FORM
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
        rating: Number(feedbackRating),
        message: feedbackMessage,
        createdAt: serverTimestamp(),
      });

      alert(
        "Thank you for your feedback! We appreciate your response."
      );

      setFeedbackName("");
      setFeedbackRating(5);
      setFeedbackMessage("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Unable to submit feedback. Please try again.");
    }
  };

  return (
    <div className="app">

      {/* ================================
          NAVBAR
      ================================= */}
      <nav className="navbar">
        <h2>ShopEase</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>

          <a href="#cart">
            Cart ({cartItemCount})
          </a>

          <a href="#contact">Contact Us</a>
          <a href="#feedback">Feedback</a>
          <a href="#admin">Admin</a>
        </div>
      </nav>

      {/* ================================
          SUCCESS MESSAGE
      ================================= */}
      {message && (
        <div className="cart-message">
          ✓ {message}
        </div>
      )}

      {/* ================================
          HERO SECTION
      ================================= */}
      <section id="home" className="hero">
        <h1>Welcome to ShopEase</h1>

        <p>
          Discover great products at great prices.
        </p>

        <a href="#products">
          <button>Shop Now</button>
        </a>
      </section>

      {/* ================================
          PRODUCTS
      ================================= */}
      <section id="products" className="section">

        <h2>Our Products</h2>

        <p className="section-description">
          Browse our latest products.
        </p>

        <div className="products">

          {products.length === 0 ? (
            <p>No products available.</p>
          ) : (
            products.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                )}

                <h3>{product.name}</h3>

                <p className="category">
                  {product.category}
                </p>

                <p>{product.description}</p>

                <h3>
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </h3>

                <button
                  className="buy-btn"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>

              </div>

            ))
          )}

        </div>
      </section>

      {/* ================================
          CART
      ================================= */}
      <section id="cart" className="cart-section">

        <h2>Your Cart</h2>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>

            <a href="#products">
              <button>Continue Shopping</button>
            </a>
          </div>
        ) : (

          <div className="cart-container">

            <div className="cart-items">

              {cart.map((item) => (

                <div
                  className="cart-item"
                  key={item.id}
                >

                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                    />
                  )}

                  <div className="cart-item-info">

                    <h3>{item.name}</h3>

                    <p>
                      ₹{Number(item.price).toLocaleString("en-IN")}
                    </p>

                    <div className="quantity-controls">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>

                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              ))}

            </div>

            <div className="cart-summary">

              <h3>Order Summary</h3>

              <p>
                Items: {cartItemCount}
              </p>

              <h2>
                Total: ₹{cartTotal.toLocaleString("en-IN")}
              </h2>

              <button
                className="checkout-btn"
                onClick={() =>
                  alert("Checkout feature coming soon!")
                }
              >
                Proceed to Checkout
              </button>

            </div>

          </div>
        )}

      </section>

      {/* ================================
          CONTACT US
      ================================= */}
      <section id="contact" className="contact-section">

        <div className="section-header">
          <h2>Contact Us</h2>

          <p>
            Have a question or need help? Send us a message
            and our team will get back to you.
          </p>
        </div>

        <div className="contact-container">

          {/* CONTACT INFORMATION */}
          <div className="contact-info">

            <h3>Get in Touch</h3>

            <p>
              We are here to help you with your shopping
              experience.
            </p>

            <div className="contact-detail">
              <span>📧</span>

              <div>
                <h4>Email</h4>
                <p>support@shopease.com</p>
              </div>
            </div>

            <div className="contact-detail">
              <span>📞</span>

              <div>
                <h4>Phone</h4>
                <p>+91 98765 43210</p>
              </div>
            </div>

            <div className="contact-detail">
              <span>📍</span>

              <div>
                <h4>Address</h4>
                <p>India</p>
              </div>
            </div>

          </div>

          {/* CONTACT FORM */}
          <form
            className="contact-form"
            onSubmit={submitContactForm}
          >

            <input
              type="text"
              placeholder="Your Name *"
              value={contactName}
              onChange={(e) =>
                setContactName(e.target.value)
              }
            />

            <input
              type="email"
              placeholder="Your Email *"
              value={contactEmail}
              onChange={(e) =>
                setContactEmail(e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Subject *"
              value={contactSubject}
              onChange={(e) =>
                setContactSubject(e.target.value)
              }
            />

            <textarea
              placeholder="Your Message *"
              rows="6"
              value={contactMessage}
              onChange={(e) =>
                setContactMessage(e.target.value)
              }
            />

            <button
              type="submit"
              className="contact-btn"
            >
              Send Message
            </button>

          </form>

        </div>
      </section>

      {/* ================================
          CUSTOMER FEEDBACK
      ================================= */}
      <section id="feedback" className="feedback-section">

        <div className="section-header">

          <h2>Customer Feedback</h2>

          <p>
            Your feedback helps us improve ShopEase.
          </p>

        </div>

        <div className="feedback-container">

          <form
            className="feedback-form"
            onSubmit={submitFeedback}
          >

            <input
              type="text"
              placeholder="Your Name *"
              value={feedbackName}
              onChange={(e) =>
                setFeedbackName(e.target.value)
              }
            />

            <div className="rating-section">

              <label>
                How would you rate your experience?
              </label>

              <div className="star-rating">

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    type="button"
                    key={star}
                    className={
                      star <= feedbackRating
                        ? "star active"
                        : "star"
                    }
                    onClick={() =>
                      setFeedbackRating(star)
                    }
                  >
                    ★
                  </button>

                ))}

              </div>

              <p className="rating-text">
                {feedbackRating} out of 5
              </p>

            </div>

            <textarea
              placeholder="Tell us about your experience *"
              rows="6"
              value={feedbackMessage}
              onChange={(e) =>
                setFeedbackMessage(e.target.value)
              }
            />

            <button
              type="submit"
              className="feedback-btn"
            >
              Submit Feedback
            </button>

          </form>

          <div className="feedback-message">

            <div className="feedback-icon">
              ★
            </div>

            <h3>We Value Your Opinion</h3>

            <p>
              Every review helps us understand what our
              customers love and where we can improve.
            </p>

            <div className="feedback-points">
              <p>✓ Improve our products</p>
              <p>✓ Improve customer service</p>
              <p>✓ Create a better shopping experience</p>
            </div>

          </div>

        </div>
      </section>

      {/* ================================
          ADMIN
      ================================= */}
      <section id="admin" className="admin-section">

        <h2>Admin Panel</h2>

        <p>
          Add new products to the store.
        </p>

        <form
          className="product-form"
          onSubmit={addProduct}
        >

          <input
            type="text"
            placeholder="Product Name *"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Price *"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Category *"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) =>
              setImage(e.target.value)
            }
          />

          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <button
            type="submit"
            className="admin-btn"
          >
            Add Product
          </button>

        </form>

        {/* ADMIN PRODUCT LIST */}
        <div className="admin-products">

          <h3>Manage Products</h3>

          {products.map((product) => (

            <div
              className="admin-product"
              key={product.id}
            >

              <span>
                {product.name} — ₹{product.price}
              </span>

              <button
                className="delete-btn"
                onClick={() =>
                  deleteProduct(product.id)
                }
              >
                Delete
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* ================================
          FOOTER
      ================================= */}
      <footer>

        <div className="footer-content">

          <div>
            <h3>ShopEase</h3>

            <p>
              Your simple and reliable online shopping
              destination.
            </p>
          </div>

          <div className="footer-links">

            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#cart">Cart</a>
            <a href="#contact">Contact Us</a>
            <a href="#feedback">Feedback</a>

          </div>

        </div>

        <div className="footer-bottom">
          <p>© 2026 ShopEase. All rights reserved.</p>
        </div>

      </footer>

    </div>
  );
}

export default App;