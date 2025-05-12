// src/features/api/tailor.api.js
import { apiSlice } from "./apiSlice";

export const tailorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTailor: builder.mutation({
      query: (tailorData) => ({
        url: '/tailors',
        method: 'POST',
        body: tailorData,
      }),
      invalidatesTags: ['Tailor'],
    }),
    getAllTailors: builder.query({
      query: () => '/tailors',
      providesTags: ['Tailor'],
    }),
    getTailorById: builder.query({
      query: (id) => `/tailors/${id}`,
      providesTags: (result, error, { id }) => [{ type: 'Tailor', id }],
    }),
    updateTailor: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/tailors/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tailor', id },
        { type: 'Tailor', id: 'LIST' },
      ],
    }),

    deleteTailor: builder.mutation({
      query: (id) => ({
        url: `/tailors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Tailor', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateTailorMutation,
  useGetAllTailorsQuery,
  useGetTailorByIdQuery,
  useUpdateTailorMutation,
  useDeleteTailorMutation,
} = tailorApi;
