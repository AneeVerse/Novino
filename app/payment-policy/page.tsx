import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { CreditCard, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Payment Policy | Novino.io",
  description:
    "Learn about Novino.io's accepted payment methods, security measures, refund policies, and payment-related terms.",
};

export default function PaymentPolicyPage() {

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
          <CreditCard className="w-8 h-8 mr-3 text-[#AE876D]" />
          <h1 className="text-3xl md:text-4xl font-bold">Payment Policy</h1>
        </div>

        <div className="bg-[#333333] rounded-lg p-6 md:p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Novino.io accepts the following payment methods to ensure a convenient and secure 
            checkout experience.
          </p>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Accepted Payment Methods</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li><strong>UPI:</strong> Pay instantly using your UPI ID or QR code</li>
              <li><strong>Credit/Debit Cards:</strong> Visa, Mastercard, American Express, Rupay</li>
              <li><strong>Net Banking:</strong> Direct bank transfer from all major banks</li>
              <li><strong>Digital Wallets:</strong> Paytm, PhonePe, Google Pay, and other popular wallets</li>
              <li><strong>Cash on Delivery (COD):</strong> Available domestically with an additional charge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Pricing and Taxes</h2>
            <p className="text-gray-300 leading-relaxed">
              All prices displayed on our website are inclusive of applicable taxes including GST. 
              The final amount at checkout will reflect the total payable amount with no hidden charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Payment Security</h2>
            <p className="text-gray-300 leading-relaxed">
              Payment processing is secured with industry-standard encryption and SSL technology. 
              We do not store your complete credit/debit card information on our servers. All 
              transactions are processed through secure payment gateways.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Refunds</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Refunds for canceled or returned orders are processed within 24-72 hours after 
              approval. The refund will be credited to the original payment method.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
              <li>Credit/Debit Cards: 5-7 business days</li>
              <li>Net Banking: 5-7 business days</li>
              <li>UPI/Wallets: 2-3 business days</li>
              <li>Cash on Delivery: Refund via bank transfer or store credit</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Gift Cards and Discount Codes</h2>
            <p className="text-gray-300 leading-relaxed">
              Gift cards and discount codes can be applied at checkout. Please note:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4 mt-2">
              <li>Only one discount code can be used per order</li>
              <li>Gift cards can be combined with discount codes</li>
              <li>Discount codes cannot be applied to already discounted items (unless specified)</li>
              <li>Codes are case-sensitive and must be entered exactly as provided</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Failed Transactions</h2>
            <p className="text-gray-300 leading-relaxed">
              If your payment fails, please check your payment details and try again. If amount 
              is debited but order is not confirmed, please contact us immediately. The amount 
              will be automatically refunded within 5-7 business days if the transaction fails.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Currency</h2>
            <p className="text-gray-300 leading-relaxed">
              All transactions are processed in Indian Rupees (INR) for domestic orders. 
              International orders may be charged in the local currency or USD depending on 
              your location.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-[#444444]">
            <p className="text-gray-400 text-sm">
              For any payment concerns or queries, please contact our support team at{" "}
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

