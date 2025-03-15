// Contact.jsx
import React, { useState } from 'react';

function Contact() {
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const res = await fetch("/submit", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      setResponseMsg(text); // 显示后端返回的结果
    } catch (error) {
      setResponseMsg("Error sending message. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Name:
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Email:
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Message:
          </label>
          <textarea
            name="message"
            rows="4"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-black"
          ></textarea>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
        >
          Send Message
        </button>
      </form>

      {responseMsg && (
        <p className="mt-4 text-sm">
          {responseMsg}
        </p>
      )}
    </div>
  );
}

export default Contact;