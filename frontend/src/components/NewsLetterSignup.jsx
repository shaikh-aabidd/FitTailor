import React, { useState } from 'react';

const NewsLetterSignup = () => {
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate with newsletter API
    alert(`Subscribed ${email}`);
    setEmail('');
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 bg-primary-light-bg p-6 rounded-xl text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">Subscribe for 10% Off</h2>
        <p className="text-gray-700 mb-4">Get exclusive offers and tailoring tips straight to your inbox.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="px-4 py-2 rounded-l-md sm:rounded-none sm:rounded-l-md border border-gray-300 flex-grow focus:outline-none"
          />
          <button type="submit" className="px-6 py-2 bg-primary text-white rounded-r-md font-semibold hover:bg-primary-light transition">
            Subscribe
          </button>
        </form>
      </div>
    </section>
);
}
export default NewsLetterSignup;