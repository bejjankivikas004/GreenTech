import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ added

const AddProduct = () => {
  const navigate = useNavigate(); // ✅ added

  const [product, setProduct] = useState({
    name: "",
    scientificname: "",
    description: "",
    price: "",
    category: [],
    stockQuantity: "",
    releaseDate: "",
    productAvailable: false,
  });

  const [image, setImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCategoryChange = (categoryValue, isChecked) => {
    let updatedCategories = [...product.category];

    if (isChecked) {
      updatedCategories.push(categoryValue);
    } else {
      updatedCategories = updatedCategories.filter(
        (cat) => cat !== categoryValue
      );
    }

    setProduct({
      ...product,
      category: updatedCategories,
    });
  };

  const submitHandler = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("imageFile", image);

    formData.append(
      "product",
      new Blob([JSON.stringify(product)], {
        type: "application/json",
      })
    );

    axios
      .post("http://localhost:8080/api/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Product added successfully:", response.data);
        alert("Product added successfully");
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        alert("Error adding product");
      });
  };

  return (
    <div className="container">
      <div
        className="center-container"
        style={{ position: "relative" }}
      >
        {/* ❌ Close Button */}
        <span
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            fontSize: "22px",
            cursor: "pointer",
            background: "rgba(255,255,255,0.6)",
            padding: "5px 10px",
            borderRadius: "50%",
            backdropFilter: "blur(6px)",
          }}
        >
          ✖
        </span>

        <form className="row g-3 pt-5" onSubmit={submitHandler}>
          <div className="col-md-6">
            <h6>Name</h6>
            <input
              type="text"
              className="form-control"
              placeholder="Product Name"
              onChange={handleInputChange}
              value={product.name}
              name="name"
            />
          </div>

          <div className="col-md-6">
            <h6>Scientific Name</h6>
            <input
              type="text"
              name="scientificname"
              className="form-control"
              placeholder="Enter scientific name"
              value={product.scientificname}
              onChange={handleInputChange}
            />
          </div>

          <div className="col-12">
            <h6>Description</h6>
            <input
              type="text"
              className="form-control"
              placeholder="Add product description"
              value={product.description}
              name="description"
              onChange={handleInputChange}
            />
          </div>

          <div className="col-5">
            <h6>Price</h6>
            <input
              type="number"
              className="form-control"
              placeholder="Eg: Rs1000"
              onChange={handleInputChange}
              value={product.price}
              name="price"
            />
          </div>

          {/* ✅ CATEGORY CHECKBOX */}
          <div className="col-md-6">
            <h6>Category</h6>

            {[
              "IndoorPlants",
              "OutdoorPlants",
              "FloweringPlants",
              "Succulents & Cacti",
              "Medicinal & Herbal Plants",
              "Fruit Plants",
            ].map((cat) => (
              <div key={cat} className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  value={cat}
                  checked={product.category.includes(cat)}
                  onChange={(e) =>
                    handleCategoryChange(cat, e.target.checked)
                  }
                />
                <label className="form-check-label">{cat}</label>
              </div>
            ))}
          </div>

          <div className="col-md-4">
            <h6>Stock Quantity</h6>
            <input
              type="number"
              className="form-control"
              placeholder="Stock Remaining"
              onChange={handleInputChange}
              value={product.stockQuantity}
              name="stockQuantity"
            />
          </div>

          <div className="col-md-4">
            <h6>Release Date</h6>
            <input
              type="date"
              className="form-control"
              value={product.releaseDate}
              name="releaseDate"
              onChange={handleInputChange}
            />
          </div>

          <div className="col-md-4">
            <h6>Image</h6>
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
            />
          </div>

          <div className="col-12">
            <input
              type="checkbox"
              checked={product.productAvailable}
              onChange={(e) =>
                setProduct({
                  ...product,
                  productAvailable: e.target.checked,
                })
              }
            />
            <label> Product Available</label>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;