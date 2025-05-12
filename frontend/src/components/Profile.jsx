// src/components/Profile.jsx
import React from "react";
import { useGetCurrentUserQuery } from "../features/api/user.api";
import { data, Link } from "react-router-dom";
import Loader from "./Loader";
import Button from "./Button";
import { useSelector } from "react-redux";
import DeleteMeasurementButton from "./DeleteMeasurement";
import { useGetAllMeasurementsQuery } from "../features/api/measurement.api";
import { useGetCartItemsQuery } from "../features/api/cart.api";

function Profile() {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { data: cartItems = [], isLoading: cartLoading } = useGetCartItemsQuery();
  const {data:measurements} = useGetAllMeasurementsQuery();

  console.log("Measurements",measurements)
  // If we’re still loading auth, or no user yet, show a loader
  if (!isAuthenticated) {
    return <Loader fullScreen />;
  }
  if (!user) {
    return <p className="text-center py-8">No profile data.</p>;
  }
  if(cartLoading){  
    return <Loader />
  }

  const {
    name,
    email,
    role,
    phone,
    addresses = [],
    measurementProfiles = [],
    orders = [],
    cart = [],
    createdAt,
    updatedAt,
  } = user;



  console.log("user",user)

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Account Details
          </h2>
          <p>
            <span className="font-medium">Name:</span> {name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {phone}
          </p>
          <p>
            <span className="font-medium">Role:</span> {role}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Member since {formatDate(createdAt)}
          </p>
        </div>
        <div className="bg-white shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity</h2>
          <p>
            <span className="font-medium">Orders:</span> {orders.length}
          </p>
          <p>
            <span className="font-medium">Measurement Profiles:</span>{" "}
            {measurements?.data?.length}
          </p>
          <p>
            <span className="font-medium">Items in Cart:</span> {cartItems.data?.length}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Last updated {formatDate(updatedAt)}
          </p>
          <Link
            to="/orders/track"
            className="inline-block mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-light transition"
          >
            View Orders
          </Link>
        </div>
      </div>

      {/* Addresses */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          My Addresses
        </h2>
        {addresses.length === 0 ? (
          <p className="text-gray-600">You have no saved addresses.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`bg-white shadow p-6 ${
                  addr.isDefault ? "border-2 border-accent" : ""
                }`}
              >
                <p>{addr.street}</p>
                <p>
                  {addr.city}, {addr.state} {addr.zipCode}
                </p>
                <p className="capitalize">{addr.type}</p>
                {addr.isDefault && (
                  <span className="text-accent font-semibold">Default</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Measurement Profiles */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Measurement Profiles
        </h2>
        {measurements?.data?.length === 0 ? (
          <p className="text-gray-600">No measurement profiles created yet.</p>
        ) : (
          <ul className="space-y-2">
            {measurements?.data.map((profile) => (
              <li
              key={profile._id}
              className="bg-white shadow p-4 flex justify-between items-center"
            >
              <span>{profile.profileName}</span>
            
              <div className="flex items-center gap-4">
                <Link
                  to={`/measurement/${profile._id}`}
                  className="text-primary hover:underline"
                >
                  Edit
                </Link>
            
                <Link
                  to={`/measurement/${profile._id}?view=true`}
                  className="text-primary hover:underline"
                >
                  Show
                </Link>
            
                <DeleteMeasurementButton id={profile._id} />
              </div>
            </li>
            ))}
          </ul>
        )}
        <Link to={`/measurement/new`}>
          <Button className={`my-3`} variant={"primary"}>
            + New Measurement
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Profile;
