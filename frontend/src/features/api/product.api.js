import { apiSlice } from "./apiSlice";

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: ({ page = 1, limit = 12 }) => ({
        url: '/products',
        params: { page, limit },
      }),
      transformResponse: (response) => response.data,   // if you wrap data
      providesTags: (result, error) =>
        result
          ? [
              // this tag tells RTKQ “when someone invalidates LIST, refetch me”
              { type: 'Product', id: 'LIST' },
              // these tags tell RTKQ “if you invalidate an individual product, update me”
              ...result.docs.map(({ _id }) => ({ type: 'Product', id: _id })),
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, { id }) => [{ type: "Product", id }],
    }),

    createProduct: builder.mutation({
      // auto-detect FormData vs. plain object
      query: (productData) => {
        if (productData instanceof FormData) {
          // we’ve already built the FormData in onSubmit
          return {
            url: "/products",
            method: "POST",
            body: productData,
          };
        }
        // fallback for plain-object calls (if you ever want them):
        const formData = new FormData();
        Object.entries(productData).forEach(([key, value]) => {
          if (key === "images") {
            value.forEach((file) => formData.append("images", file));
          } else {
            formData.append(key, value);
          }
        });
        return {
          url: "/products",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Product"],
    }),

    createCustomProduct: builder.mutation({
      query: ({ fabricId, collarStyle, sleeveStyle, tailorId, addOns, price }) => ({
        url: '/products/custom',
        method: 'POST',
        body: { fabricId, collarStyle, sleeveStyle, tailorId, addOns, price }
      }),
      invalidatesTags: ['Product']
    }),

    updateProduct: builder.mutation({
      query: ({ productId, updatedData }) => ({
        url: `/products/${productId}`,
        method: "PATCH",
        body: updatedData,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateCustomProductMutation
} = productApi;
