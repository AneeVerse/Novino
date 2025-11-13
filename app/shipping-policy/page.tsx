import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Truck, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy | Novino.io",
  description:
    "Learn about Novino.io's shipping options, delivery times, and policies for domestic and international orders.",
};

export default function ShippingPolicyPage() {

  return (
    <div className="min-h-screen bg-[#2D2D2D] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/#site-footer"
          className="inline-flex items-center text-[#AE876D] hover:text-[#8d6c58] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Home</span>
        </Link>

        <div className="flex items-center mb-8">
          <Truck className="w-8 h-8 mr-3 text-[#AE876D]" />
          <h1 className="text-3xl md:text-4xl font-bold">Shipping Policy</h1>
        </div>

        <div className="bg-[#333333] rounded-lg p-6 md:p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Novino.io strives to deliver products promptly with the following shipping options.
          </p>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Domestic Shipping</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Standard delivery in 3-6 business days, with free shipping over a set order value. 
              Express options available at an additional charge.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Standard Delivery: 3-6 business days</li>
              <li>Express Delivery: 1-2 business days (additional charges apply)</li>
              <li>Free shipping available on orders above a minimum value</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">International Shipping</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Available for select regions, delivery times and rates vary. Free shipping offered 
              for orders above a defined amount.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Delivery times: 7-15 business days (varies by region)</li>
              <li>Customs and import duties may apply</li>
              <li>Free international shipping on orders above specified threshold</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Order Processing</h2>
            <p className="text-gray-300 leading-relaxed">
              Orders are processed Monday to Saturday, excluding Sundays and public holidays. 
              Orders placed on weekends or holidays will be processed on the next business day.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              Shipment tracking details will be provided via email upon dispatch. You can track 
              your order status in real-time using the tracking link provided.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Delays</h2>
            <p className="text-gray-300 leading-relaxed">
              Novino.io is not responsible for delays caused by carriers or unforeseen circumstances 
              such as weather conditions, natural disasters, or customs clearance issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Returns and Exchanges</h2>
            <p className="text-gray-300 leading-relaxed">
              For information about returns and exchanges, please refer to our Returns Policy. 
              Items must be in original condition with tags attached for returns to be accepted.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-[#444444]">
            <p className="text-gray-400 text-sm">
              For shipping inquiries, contact us at{" "}
              <a href="mailto:business@novino.io" className="text-[#AE876D] hover:underline">
                business@novino.io
              </a>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

