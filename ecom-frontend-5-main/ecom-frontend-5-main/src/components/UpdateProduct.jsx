import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UpdateProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState();

  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    scientificname: "",
    price: "",
    category: [], // ✅ array
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/product/${id}`
        );

        setProduct(response.data);

        const responseImage = await axios.get(
          `http://localhost:8080/api/product/${id}/image`,
          { responseType: "blob" }
        );

        const imageFile = await converUrlToFile(
          responseImage.data,
          response.data.imageName
        );

        setImage(imageFile);

        // ✅ FIX: ensure category is always array
        setUpdateProduct({
          ...response.data,
          category: Array.isArray(response.data.category)
            ? response.data.category
            : response.data.category
            ? [response.data.category]
            : [],
        });

      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const converUrlToFile = async (blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedProduct = new FormData();
    updatedProduct.append("imageFile", image);

    updatedProduct.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], {
        type: "application/json",
      })
    );

    axios
      .put(`http://localhost:8080/api/product/${id}`, updatedProduct, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        alert("Product updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        alert("Failed to update product.");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUpdateProduct({
      ...updateProduct,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // ✅ CHECKBOX HANDLER
  const handleCategoryChange = (categoryValue, isChecked) => {
    let updatedCategories = [...updateProduct.category];

    if (isChecked) {
      updatedCategories.push(categoryValue);
    } else {
      updatedCategories = updatedCategories.filter(
        (cat) => cat !== categoryValue
      );
    }

    setUpdateProduct({
      ...updateProduct,
      category: updatedCategories,
    });
  };

  return (
    <div className="update-product-container">
      <div className="center-container" style={{ marginTop: "7rem" }}>
        <h1>Update Product</h1>

        <form className="row g-3 pt-1" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <h6>Name</h6>
            <input
              type="text"
              className="form-control"
              value={updateProduct.name}
              onChange={handleChange}
              name="name"
            />
          </div>

          <div className="col-md-6">
            <h6>Scientific Name</h6>
            <input
              type="text"
              name="scientificname"
              className="form-control"
              value={updateProduct.scientificname}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <h6>Description</h6>
            <input
              type="text"
              className="form-control"
              name="description"
              value={updateProduct.description}
              onChange={handleChange}
            />
          </div>

          <div className="col-5">
            <h6>Price</h6>
            <input
              type="number"
              className="form-control"
              name="price"
              value={updateProduct.price}
              onChange={handleChange}
            />
          </div>

          {/* ✅ CHECKBOX CATEGORY */}
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
                  checked={updateProduct.category.includes(cat)}
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
              name="stockQuantity"
              value={updateProduct.stockQuantity}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-8">
            <h6>Image</h6>
            <img
              src={image ? URL.createObjectURL(image) : ""}
              alt="product"
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
              }}
            />

            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
            />
          </div>

          <div className="col-12">
            <input
              type="checkbox"
              checked={updateProduct.productAvailable}
              onChange={(e) =>
                setUpdateProduct({
                  ...updateProduct,
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

export default UpdateProduct;