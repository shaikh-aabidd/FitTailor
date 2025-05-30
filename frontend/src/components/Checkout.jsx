import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import Button from "../components/Button";

import { useGetCurrentUserQuery } from "../features/api/user.api";
import { useClearCartMutation } from "../features/api/cart.api";
import { useCreateOrderMutation } from "../features/api/order.api";
import { useGetAllMeasurementsQuery } from "../features/api/measurement.api";

import { setCredentials } from "../features/auth/authSlice";
import { setCurrentStep } from "../features/CustomizationSlice";
import { useGetProductByIdQuery } from "../features/api/product.api";

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Auth & cart state ---
  const { data: userResp, isLoading: authLoading } = useGetCurrentUserQuery();
  const user = useSelector((s) => s.auth.user) || {};
  const cartItems = user.cart || [];
  const customization = useSelector((s) => s.customization);
  const customProductId = customization.newProductId;
  const selectedMeasurementId = customization.measurementProfileId;

  const { data: customProductResp } = useGetProductByIdQuery(customProductId, { skip: !customProductId })
  const customPrice = customProductResp?.data?.price ?? 0
console.log(user)
  // console.log("Measurement Data ",customization.measurementData);
  // console.log("selected fabric Data ",customization.garment);
    
  // --- RTK Query mutations & queries ---
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const [clearCart, { isLoading: clearingCart }] = useClearCartMutation();
  const { data: measurementsData, isLoading: fetchingMeasurements } =
    useGetAllMeasurementsQuery();

  // Hydrate auth slice
  useEffect(() => {
    if (userResp?.data) {
      dispatch(setCredentials(userResp.data));
    }
  }, [userResp, dispatch]);

  // --- Address form setup ---
  const defaultAddr = user.addresses?.find((a) => a.isDefault) || {};
  const [selectedAddressId, setSelectedAddressId] = useState(
    defaultAddr._id || ""
  );
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...defaultAddr,
      comment: "",
    },
  });
  useEffect(() => {
    const addr =
      user.addresses?.find((a) => a._id === selectedAddressId) || defaultAddr;
    reset({ ...addr, comment: "" });
  }, [selectedAddressId, user.addresses, reset]);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  // --- Calculate total ---
  const customizationPrice = (() => {
    let base = 100;
    let addons = 0;
    if (customization.addOns.monogramming) addons += 10;
    if (customization.addOns.giftWrapping) addons += 5;
    if (customization.addOns.expressDelivery) addons += 20;
    if (customization.addOns.careKit) addons += 15;
    return base + addons;
  })();
  const cartTotal = cartItems.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  console.log("cart toatl",cartTotal)
   const totalAmount = cartTotal + (customProductId ? customizationPrice + customPrice : 0);

  // --- Updated onSubmit handler ---
  const onSubmit = async ({ street, city, state, zipCode, comment }) => {
    // 1. Prepare all orders to create
    const ordersToCreate = [];

    // Add orders for cart items
    cartItems.forEach((cartItem) => {
      ordersToCreate.push({
        productId: cartItem.product._id,
        quantity: cartItem.quantity,
        deliveryAddress: { street, city, state, zipCode, type: "custom" },
        paymentMethod,
        totalAmount: cartItem.product.price * cartItem.quantity,
        tailorNotes: comment,
      });
    });

    // Add custom product order if present
    if (customProductId) {
      ordersToCreate.push({
        productId: customProductId,
        quantity: 1,
        measurementId: selectedMeasurementId || null,
        designChoices: {
          fabricId: customization.fabric,
          collarStyle: customization.designChoices.collar,
          sleeveStyle: customization.designChoices.sleeves,
          tailorId: customization.tailorInfo._id,
          addOns: Object.keys(customization.addOns).filter(
            (k) => customization.addOns[k]
          ),
          price: customizationPrice,
        },
        deliveryAddress: { street, city, state, zipCode, type: "custom" },
        paymentMethod,
        totalAmount: customizationPrice + customPrice,
        tailorNotes: comment,
      });
    }

    // 2. Validate at least one order
    if (ordersToCreate.length === 0) {
      return toast.error("No products to order");
    }

    try {
      // 3. Create all orders in parallel
      await Promise.all(
        ordersToCreate.map((payload) => createOrder(payload).unwrap())
      );

      toast.success(`${ordersToCreate.length} orders placed successfully!`);
      dispatch(setCurrentStep(1));

      // 4. Clear cart only if there were cart items
      if (cartItems.length > 0) {
        await clearCart().unwrap();
      }

      navigate("/orders/track");
    } catch (err) {
      console.error(err);
      toast.error(err.data?.message || "Failed to place some orders");
    }
  };
  if (
    authLoading ||
    creatingOrder ||
    fetchingMeasurements ||
    clearingCart ||
    !user.addresses
  ) {
    return <Loader fullScreen />;
  }

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Address & Comments */}
      <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Delivery Address</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Radio list */}
          <div className="space-y-2 mb-6">
            {user.addresses.map((a) => (
              <label
                key={a._id}
                className="flex items-start space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="selectedAddress"
                  value={a._id}
                  checked={selectedAddressId === a._id}
                  onChange={() => setSelectedAddressId(a._id)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium">
                    {a.street}, {a.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    {a.state}, {a.zipCode} ({a.type})
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["street", "city", "state", "zipCode"].map((fld) => (
              <input
                key={fld}
                {...register(fld, { required: fld !== "comment" })}
                placeholder={fld.charAt(0).toUpperCase() + fld.slice(1)}
                className="w-full p-2 border rounded-lg"
              />
            ))}
          </div>
          <textarea
            {...register("comment")}
            placeholder="Add a comment (optional)"
            rows={3}
            className="w-full p-2 border rounded-lg"
          />
        </form>
      </div>

      {/* Summary & Pay */}
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-semibold">Order Summary</h2>
        <div className="space-y-2">
          {cartItems.map((i) => (
            <div
              key={i.product._id}
              className="flex justify-between text-gray-700"
            >
              <span>
                {i.product.name} × {i.quantity}
              </span>
              <span>${(i.product.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          {customProductId && (
            <div className="border-t pt-4 space-y-2">
              <h3 className="font-semibold">Custom Garment</h3>
              <div className="flex justify-between">
                <span>Your custom piece</span>
                <span>${(customPrice+customizationPrice).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4 flex justify-between font-medium">
          <span>Total</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>

        {/* Payment */}
        <div className="space-y-2">
          {["cod", "online"].map((pm) => (
            <label key={pm} className="flex items-center space-x-2">
              <input
                type="radio"
                value={pm}
                checked={paymentMethod === pm}
                onChange={() => setPaymentMethod(pm)}
                className="mt-1"
              />
              <span>
                {pm === "cod" ? "Cash on Delivery" : "Online Payment"}
              </span>
            </label>
          ))}
        </div>

        <Button onClick={handleSubmit(onSubmit)} className="w-full py-3">
          {creatingOrder ? "Placing Order..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
}
