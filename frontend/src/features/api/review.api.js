// src/features/api/review.api.js
import { apiSlice } from "./apiSlice";

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Reviews tied to a specific product
    getReviewsByProduct: builder.query({
      query: (productId) => `/reviews/product/${productId}`,
      providesTags: ['Review'],
    }),
    createReview: builder.mutation({
      query: ({ productId, reviewData }) => ({
        url: `/reviews/product/${productId}`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review'],
    }),
    // Reviews for the current user
    getMyReviews: builder.query({
      query: () => `/reviews/me`,
      providesTags: ['Review'],
    }),
    updateReview: builder.mutation({
      query: ({ reviewId, updates }) => ({
        url: `/reviews/${reviewId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { reviewId }) => [{ type: 'Review', reviewId }],
    }),
    deleteReview: builder.mutation({
      query: (reviewId) => ({
        url: `/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const {
  useGetReviewsByProductQuery,
  useCreateReviewMutation,
  useGetMyReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;
