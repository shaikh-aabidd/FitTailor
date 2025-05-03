import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateProductMutation,
  useGetAllProductsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "../features/api/product.api";
import Loader from "../components/Loader";
import { toast } from "react-toastify";

export default function AdminProductPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { data: productsData, isLoading } = useGetAllProductsQuery({
    page: 1,
    limit: 100,
  });
  const [addProduct,{isLoading:isCreating}] = useCreateProductMutation();
  const [updateProduct,{isLoading:isUpdating}] = useUpdateProductMutation();
  const [deleteProduct,{isLoading:isDeleting}] = useDeleteProductMutation();
  const [previews, setPreviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading || isCreating || isUpdating || isDeleting) return <Loader fullScreen />;

  const products = productsData.docs.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (values) => {
    const fd = new FormData();
    fd.append("name", values.name);
    fd.append("price", values.price);
    fd.append("category", values.category);
    fd.append("fabricType", values.fabricType);
    fd.append("stock", values.stock);            // ← include stock
    fd.append("description",values.description)
    Array.from(values.images).forEach((f) => fd.append("images", f));

    try {
      await addProduct(fd).unwrap();
      toast.success("Product created");
      reset();
      setPreviews([]);
    } catch {
      toast.error("Create failed");
    }
  };

  const handleImagePreview = (e) => {
    setPreviews(Array.from(e.target.files).map((f) => URL.createObjectURL(f)));
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateProduct({ productId:id, updatedData:updates }).unwrap();
      toast.success("Updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Management</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-4 mb-6 shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {/* Name */}
          <div>
            <input
              {...register("name", { required: true })}
              placeholder="Name"
              className="border p-2 w-full"
            />
            {errors.name && <span className="text-red-500">Required</span>}
          </div>
          {/* Price */}
          <div>
            <input
              {...register("price", { required: true, valueAsNumber: true })}
              type="number"
              placeholder="Price"
              className="border p-2 w-full"
            />
            {errors.price && <span className="text-red-500">Required</span>}
          </div>
          {/* Category */}
          <div>
            <select
              {...register("category", { required: true })}
              className="border p-2 w-full"
            >
              <option value="shirt">Shirt</option>
              <option value="pants">Pants</option>
              <option value="suit">Suit</option>
              <option value="unstiched">Unstitched</option>
            </select>
          </div>
          {/* Fabric */}
          <div>
            <select
              {...register("fabricType", { required: true })}
              className="border p-2 w-full"
            >
              <option value="cotton">Cotton</option>
              <option value="silk">Silk</option>
              <option value="linen">Linen</option>
              <option value="wool">Wool</option>
            </select>
          </div>
          {/* Stock */}
          <div>
            <input
              {...register("stock", { required: true, valueAsNumber: true })}
              type="number"
              placeholder="Stock"
              className="border p-2 w-full"
            />
            {errors.stock && (
              <span className="text-red-500">Required</span>
            )}
          </div>
        </div>

        <div>
            <textarea
              {...register("description", { required: true})}
              type="string"
              placeholder="description..."
              className="border p-2 w-full mt-4"
            />
            {errors.description && (
              <span className="text-red-500">Required</span>
            )}
          </div>
        {/* Images */}
        <div className="mt-4">
          <label className="block mb-1">Upload Images</label>
          <input
            {...register("images", { required: true })}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleImagePreview(e);
            }}
            className="block w-full"
          />
          {errors.images && (
            <span className="text-red-500">
              At least one image required
            </span>
          )}
          <div className="flex gap-4 mt-2">
            {previews.map((src) => (
              <img
                key={src}
                src={src}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </form>

      {/* Products Table */}
      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Price</th>
            <th className="p-2">Category</th>
            <th className="p-2">Fabric</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Description</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod._id} className="border-t">
              <td className="p-2">
                <input
                  defaultValue={prod.name}
                  onBlur={(e) =>
                    handleUpdate(prod._id, { name: e.target.value })
                  }
                  className="border p-1 w-full"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={prod.price}
                  onBlur={(e) =>
                    handleUpdate(prod._id, {
                      price: Number(e.target.value),
                    })
                  }
                  className="border p-1 w-28"
                />
              </td>
              <td className="p-2">{prod.category}</td>
              <td className="p-2">{prod.fabricType}</td>
              <td className="p-2">
                <input
                  type="number"
                  defaultValue={prod.stock}
                  onBlur={(e) =>
                    handleUpdate(prod._id, {
                      stock: Number(e.target.value),
                    })
                  }
                  className="border p-1  w-28"
                />
              </td>
              <td className="p-2">
                <textarea
                  type="string"
                  defaultValue={prod.description}
                  onBlur={(e) =>
                    handleUpdate(prod._id, {
                      description: String(e.target.value),
                    })
                  }
                  className="border p-1 w-full"
                />
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(prod._id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-center p-4 text-gray-500"
              >
                No products match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
