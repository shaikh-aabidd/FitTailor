    import { apiSlice } from "./apiSlice";

    export const orderApi = apiSlice.injectEndpoints({
        endpoints:(builder)=>({
            getAllOrders: builder.query({
                query: ({ page=1, limit=10, status="" }={}) => ({
                  url: '/orders',
                  params: { page, limit, status }
                }),
                providesTags: (result) => {
                  // Handle all possible undefined/null scenarios
                  if (!result) return [{ type: 'Order', id: 'LIST' }];
                  
                  const docs = result.docs || result.data?.docs || [];
                  
                  return [
                    { type: 'Order', id: 'LIST' },
                    ...docs.map(order => ({ type: 'Order', id: order._id }))
                  ];
                }
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
                invalidatesTags: [
                    'Order',
                    'CurrentUser',
                    { type: 'Cart', id: 'LIST' }
                ],
            }),

            updateOrderStatus: builder.mutation({
                query: ({ orderId, status }) => ({
                  url: `/orders/${orderId}/status`,
                  method: 'PATCH',
                  body: { status }
                }),
                invalidatesTags: (result, error, { orderId }) => [
                  { type: 'Order', id: orderId },
                  { type: 'Order', id: 'LIST' }
                ]
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