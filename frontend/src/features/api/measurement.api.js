import { apiSlice } from "./apiSlice";

export const measurementApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMeasurements: builder.query({
      query: () => '/measurements',
      providesTags: (result = { data: [] }) => [
        { type: 'Measurement', id: 'LIST' },
        ...result.data.map((m) => ({ type: 'Measurement', id: m._id })),
      ],
    }),
    
    getMeasurementById: builder.query({
      query: (id) => `/measurements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Measurement', id }],
    }),
    addMeasurement: builder.mutation({
      query: (measurementData) => ({
        url: '/measurements',
        method: 'POST',
        body: measurementData,
      }),
      invalidatesTags: [{ type: 'Measurement', id: 'LIST' }],
    }),
    updateMeasurement: builder.mutation({
      query: ({ id, updates }) => ({
        url: `/measurements/${id}`,
        method: 'PATCH',
        body: updates,
      }), 
      invalidatesTags: (result, error, { id }) => [{ type: 'Measurement', id }],
    }),
    deleteMeasurement: builder.mutation({
      query: (id) => ({
        url: `/measurements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Measurement', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMeasurementByIdQuery,
  useAddMeasurementMutation,
  useUpdateMeasurementMutation,
  useDeleteMeasurementMutation,
  useGetAllMeasurementsQuery,
} = measurementApi;