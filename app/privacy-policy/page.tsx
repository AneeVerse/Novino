import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Novino.io",
  description:
    "Learn about how Novino.io collects, uses, and protects your personal information. Our privacy policy explains your rights and our data practices.",
};

export default function PrivacyPolicyPage() {

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
          <Shield className="w-8 h-8 mr-3 text-[#AE876D]" />
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        </div>

        <div className="bg-[#333333] rounded-lg p-6 md:p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Novino.io respects your privacy and is committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you 
            visit and use our website.
          </p>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Information Collection</h2>
            <p className="text-gray-300 leading-relaxed">
              We collect information you voluntarily provide through registration, purchases, or contact forms. 
              This may include name, email, billing details, and payment information (excluding full credit card details).
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Use of Information</h2>
            <p className="text-gray-300 leading-relaxed">
              Collected data is used to process orders, improve our services, personalize your experience, 
              and communicate offers or updates.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement robust security measures including encryption and identity verification to 
              protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Third-Party Sharing</h2>
            <p className="text-gray-300 leading-relaxed">
              We may share data with trusted service providers for payment processing and delivery. 
              Your information may be transferred internationally as needed.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and analytics to understand your site usage and improve functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">User Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You may request access to, correction, or deletion of your personal data as permitted by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              Personal data is stored securely and retained only as long as necessary.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              For privacy inquiries, contact us at{" "}
              <a href="mailto:business@novino.io" className="text-[#AE876D] hover:underline">
                business@novino.io
              </a>
              .
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-[#444444]">
            <p className="text-gray-400 text-sm italic">
              By using novino.io, you consent to this Privacy Policy.
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

