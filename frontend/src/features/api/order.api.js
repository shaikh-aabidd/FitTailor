import { apiSlice } from "./apiSlice";

export const orderApi = apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        getAllOrders:builder.query({
            query:() => '/orders',
            providesTags:['Order'],
        }),

        getOrderById:builder.query({
            query:(id) => `/orders/${id}`,
            providesTags:(result,error,{id}) => [{type:'Order',id}]
        }),

        createOrder:builder.mutation({
            query:(orderData)=>({
                url:'/orders',
                method:'POST',
                body:orderData,
            }),
            invalidatesTags:['Order']
        }),

        updateOrderStatus: builder.mutation({
            query: ({ id, status }) => ({
              url: `/orders/${id}/status`,
              method: "PATCH",
              body: { status }
            }),
            invalidatesTags: ['Order']
          }),          

        deleteOrder:builder.mutation({
            query:(id)=>({
                url:`/orders/${id}`,
                method:"DELETE"
            }),
            invalidatesTags:['Order']
        }),

    })
})

export const {
    useGetAllOrdersQuery,
    useGetOrderByIdQuery,
    useCreateOrderMutation,
    useUpdateOrderStatusMutation,
    useDeleteOrderMutation,
  } = orderApi;