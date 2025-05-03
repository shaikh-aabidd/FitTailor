// features/api/cart.api.js
import { apiSlice } from "./apiSlice";

export const cartApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      // Add to Cart
      addToCart: builder.mutation({
        query: (productId) => ({
          url: '/cart',
          method: 'POST',
          body: { productId }
        }),
        transformResponse: (response) => response.data,
        invalidatesTags: ['Cart','User']
      }),
      
      // Get Cart Items
      getCartItems: builder.query({
        query: () => '/cart',
        providesTags: ['Cart'],
      }),
      
      // Update Quantity
      updateCart: builder.mutation({
        query: ({ productId, quantity }) => ({
          url: `/cart/${productId}`,
          method: 'PATCH',
          body: { quantity },
        }),
        invalidatesTags: ['Cart'],
      }),

      //clear cart
      clearCart: builder.mutation({
        query: () => ({
          url: `/cart`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Cart'],
      }),

      // Remove from Cart
      removeFromCart: builder.mutation({
        query: (productId) => ({
          url: `/cart/${productId}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Cart','User'],
        async onQueryStarted(productId, { dispatch, queryFulfilled }) {
          console.log("Query Started ")
          const patchResult = dispatch(
            apiSlice.util.updateQueryData('getCartItems', undefined, draft => {
              // Handle different response structures
              console.log("draft ",draft)
              const items = draft.data?.items || draft.data || draft;
              const newItems = items.filter(item => item.product._id !== productId);
              
              // Return the correct structure based on your API response
              return Array.isArray(draft) ? newItems : { ...draft, data: newItems };
            })
          );
          try {
            await queryFulfilled;
          } catch {
            patchResult.undo();
          }
        },
      }),
    }),
  });
  
  export const {
    useAddToCartMutation,
    useGetCartItemsQuery,
    useUpdateCartMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
  } = cartApi;