import React from 'react';

const InfoSection = () => (
  <section className="py-8 px-4 bg-white">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* Video */}
      <div className="w-full md:w-1/2">
        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/ECnC3Meyff4?si=s1PncG2mNQlmn06b"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      {/* Copy & CTA */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
          Why Go Bespoke?
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
          <li>Perfect fit</li>
          <li>Premium fabrics</li>
          <li>Handcrafted details</li>
        </ul>
        <button className="w-full md:w-auto px-6 py-3 bg-primary text-white font-semibold rounded-md hover:bg-primary-light transition">
          Get Started
        </button>
      </div>
    </div>
  </section>
);

export default InfoSection;
