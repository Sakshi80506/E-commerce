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

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "products")
      );

      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
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

      // Clear form
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setImage("");

      // Refresh products
      fetchProducts();

    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));

      setProducts(
        products.filter((product) => product.id !== id)
      );

    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <h2>ShopEase</h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#products">Products</a>
          <a href="#admin">Admin</a>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="hero">
        <h1>Welcome to ShopEase</h1>

        <p>
          Discover great products at great prices.
        </p>

        <a href="#products">
          <button>Shop Now</button>
        </a>
      </section>

      {/* Products */}
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

              <div className="product-card" key={product.id}>

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

                <p>
                  {product.description}
                </p>

                <h3>
                  ₹{product.price}
                </h3>

                <button className="buy-btn">
                  Add to Cart
                </button>

              </div>

            ))
          )}

        </div>

      </section>

      {/* Admin */}
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
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit" className="admin-btn">
            Add Product
          </button>

        </form>

      </section>

      <footer>
        <p>© 2026 ShopEase</p>
      </footer>

    </div>
  );
}

export default App;