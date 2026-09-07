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

  // Load cart from localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("shopease-cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [message, setMessage] = useState("");

  // Admin form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

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

      // Also remove from cart
      setCart((currentCart) =>
        currentCart.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2>ShopEase</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>

          <a href="#cart">
            Cart ({cartItemCount})
          </a>

          <a href="#admin">Admin</a>
        </div>
      </nav>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="cart-message">
          ✓ {message}
        </div>
      )}

      {/* HERO */}
      <section id="home" className="hero">
        <h1>Welcome to ShopEase</h1>

        <p>
          Discover great products at great prices.
        </p>

        <a href="#products">
          <button>Shop Now</button>
        </a>
      </section>

      {/* PRODUCTS */}
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

      {/* CART */}
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

      {/* ADMIN */}
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

      {/* FOOTER */}
      <footer>
        <p>© 2026 ShopEase</p>
      </footer>

    </div>
  );
}

export default App;