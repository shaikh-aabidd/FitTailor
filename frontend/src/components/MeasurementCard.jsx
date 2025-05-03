import React from "react";

export default function MeasurementCard({ data }) {
  if (!data) return <div>No measurement data found.</div>;

  const {
    profileName,
    chest,
    waist,
    height,
    notes,
    createdAt,
  } = data;

  const formattedDate = new Date(createdAt).toLocaleDateString();

  return (
    <div className="max-w-md mx-auto bg-white shadow-md  p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">{profileName}</h2>

      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <div>
          <p className="font-semibold">Chest:</p>
          <p>{chest} in</p>
        </div>
        <div>
          <p className="font-semibold">Waist:</p>
          <p>{waist} in</p>
        </div>
        <div>
          <p className="font-semibold">Height:</p>
          <p>{height} in</p>
        </div>
        <div className="col-span-2">
          <p className="font-semibold">Notes:</p>
          <p>{notes}</p>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Created on: {formattedDate}
      </div>
    </div>
  );
}
