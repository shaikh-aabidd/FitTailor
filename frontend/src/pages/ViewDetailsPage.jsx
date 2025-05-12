import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetOrderByIdQuery } from '../features/api/order.api';
import { useGetMeasurementByIdQuery } from '../features/api/measurement.api';
import { useGetProductByIdQuery } from '../features/api/product.api';
import Loader from '../components/Loader';
import MeasurementCard from '../components/MeasurementCard';
import { format } from 'date-fns';

const OrderDetails = () => {
  const { id } = useParams();
  const { data: orderData, isLoading, isError } = useGetOrderByIdQuery(id);
  const order = orderData?.data;
  // Fetch related data
  const { data: productData } = useGetProductByIdQuery(order?.product?._id, {
    skip: !order?.product
  });
  console.log(order?.measurements)
  const { data: measurementData } = useGetMeasurementByIdQuery(order?.measurements, {
    skip: !order?.measurements
  });

  if (isLoading) return <Loader fullScreen />;
  if (isError) return <div>Error loading order details</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Order Header */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">Order #{id}</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              order.status === 'placed' ? 'bg-blue-100 text-blue-800' :
              order.status === 'shipped' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status}
            </span>
            <p className="text-gray-600">
              Ordered on: {format(new Date(order?.createdAt), 'MMM dd, yyyy hh:mm a')}
            </p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Details */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            {productData?.data && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg">{productData?.data?.name}</h3>
                <p className="text-gray-600">Quantity: {order?.quantity}</p>
                <p className="text-gray-600">Price: ₹{productData?.data?.price}</p>
              </div>
            )}

            {/* Design Choices */}
            {order.designChoices && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Customization Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Collar Style</p>
                    <p className="capitalize">{order?.designChoices?.collar}</p>
                  </div>
                  <div>
                    <p className="font-medium">Sleeve Style</p>
                    <p className="capitalize ">{order?.designChoices?.sleeves}</p>
                  </div>
                  {order?.customDetails?.addOns?.length > 0 && (
                    <div className="col-span-2">
                      <p className="font-medium">Add-ons</p>
                      <p>{order?.customDetails?.addOns.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-3">
                <span>Total:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p className="text-gray-600">
                {order.deliveryAddress.street}<br />
                {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                {order.deliveryAddress.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Measurements */}
        {measurementData?.data && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Measurement Details</h2>
            <MeasurementCard data={measurementData.data} />
          </div>
        )}

        {/* Order Timeline */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Order Progress</h2>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full ${order.status === 'placed' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <p className="mt-1">Order Placed</p>
              <p>{format(new Date(order.createdAt), 'MMM dd')}</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full ${order.status === 'shipped' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <p className="mt-1">Shipped</p>
              {order.status === 'shipped' && <p>{format(new Date(order.updatedAt), 'MMM dd')}</p>}
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full ${order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <p className="mt-1">Delivered</p>
              {order.status === 'delivered' && <p>{format(new Date(order.updatedAt), 'MMM dd')}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;