import React, { useContext, useState, useEffect } from "react";
import AppContext from "../Context/Context";
import axios from "axios";
import CheckoutPopup from "./CheckoutPopup";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, removeFromCart, clearCart } = useContext(AppContext);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchImagesAndUpdateCart = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/products");
        const backendProductIds = response.data.map((product) => product.id);

        const updatedCartItems = cart.filter((item) =>
          backendProductIds.includes(item.id)
        );

        const cartItemsWithImages = await Promise.all(
          updatedCartItems.map(async (item) => {
            try {
              const res = await axios.get(
                `http://localhost:8080/api/product/${item.id}/image`,
                { responseType: "blob" }
              );
              const imageUrl = URL.createObjectURL(res.data);
              return { ...item, imageUrl };
            } catch (error) {
              console.error("Error fetching image:", error);
              return { ...item, imageUrl: "placeholder-image-url" };
            }
          })
        );

        setCartItems(cartItemsWithImages);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    if (cart.length) {
      fetchImagesAndUpdateCart();
    } else {
      setCartItems([]);
    }
  }, [cart]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotalPrice(total);
  }, [cartItems]);

  const handleIncreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) => {
      if (item.id === itemId) {
        if (item.quantity < item.stockQuantity) {
          return { ...item, quantity: item.quantity + 1 };
        } else {
          alert("Cannot add more than available stock");
        }
      }
      return item;
    });
    setCartItems(newCartItems);
  };

  const handleDecreaseQuantity = (itemId) => {
    const newCartItems = cartItems.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
        : item
    );
    setCartItems(newCartItems);
  };

  const handleRemoveFromCart = (itemId) => {
    removeFromCart(itemId);
    const newCartItems = cartItems.filter((item) => item.id !== itemId);
    setCartItems(newCartItems);
  };

  const handleCheckout = async () => {
    try {
      for (const item of cartItems) {
        const updatedStockQuantity = item.stockQuantity - item.quantity;

        const updatedProductData = {
          ...item,
          stockQuantity: updatedStockQuantity,
        };

        const cartProduct = new FormData();

        cartProduct.append(
          "product",
          new Blob([JSON.stringify(updatedProductData)], {
            type: "application/json",
          })
        );

        await axios.put(
          `http://localhost:8080/api/product/${item.id}`,
          cartProduct,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      clearCart();
      setCartItems([]);
      setShowModal(false);
      alert("Order placed successfully ✅");
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <div className="cart-container">
      <div className="shopping-cart">

        {/* ✅ HEADER WITH RED CIRCLE CLOSE BUTTON */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            marginBottom: "20px",
          }}
        >
          <div className="title">Shopping Bag</div>

          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute",
              right: "20px",
              top: "0",
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              border: "2px solid red",   // ✅ circle border
              color: "red",              // ✅ red X
              background: "rgba(255,255,255,0.2)",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "red";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
              e.target.style.color = "red";
            }}
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty" style={{ padding: "2rem" }}>
            <h4>Your cart is empty</h4>
          </div>
        ) : (
          <>
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div
                  className="item"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="description">
                    <span>{item.scientificname}</span>
                    <span>{item.name}</span>
                  </div>

                  <div className="quantity">
                    <button onClick={() => handleIncreaseQuantity(item.id)}>
                      +
                    </button>
                    <input value={item.quantity} readOnly />
                    <button onClick={() => handleDecreaseQuantity(item.id)}>
                      -
                    </button>
                  </div>

                  <div className="total-price">
                    ${item.price * item.quantity}
                  </div>

                  <button onClick={() => handleRemoveFromCart(item.id)}>
                    🗑
                  </button>
                </div>
              </li>
            ))}

            <div className="total">Total: ${totalPrice}</div>

            <Button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => setShowModal(true)}
            >
              Checkout
            </Button>
          </>
        )}
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