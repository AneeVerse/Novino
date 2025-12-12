'use client'

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsConditionsPage() {
  const searchParams = useSearchParams();
  const from = searchParams?.get('from');
  
  const backHref = from === 'login' ? '/login' : from === 'signup' ? '/signup' : '/#site-footer';
  const backText = from === 'login' || from === 'signup' ? `Back to ${from === 'login' ? 'Login' : 'Register'}` : 'Back to Home';

  return (
    <div className="min-h-screen bg-[#2D2D2D] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          href={backHref}
          className="inline-flex items-center text-[#AE876D] hover:text-[#8d6c58] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">{backText}</span>
        </Link>

        <div className="flex items-center mb-8">
          <FileText className="w-8 h-8 mr-3 text-[#AE876D]" />
          <h1 className="text-3xl md:text-4xl font-bold">Terms and Conditions</h1>
        </div>

        <div className="bg-[#333333] rounded-lg p-6 md:p-8 space-y-6">
          <p className="text-gray-300 leading-relaxed">
            Welcome to novino.io. By accessing and using this website, you agree to comply with 
            the following terms and conditions.
          </p>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">User Obligations</h2>
            <p className="text-gray-300 leading-relaxed">
              Use the site lawfully, do not interfere with site functionality, and respect 
              intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Product Orders</h2>
            <p className="text-gray-300 leading-relaxed">
              All purchases are subject to availability. Prices are inclusive of applicable taxes.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              Content on novino.io is protected and may not be replicated or used without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Account Security</h2>
            <p className="text-gray-300 leading-relaxed">
              Users are responsible for maintaining account confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Modifications</h2>
            <p className="text-gray-300 leading-relaxed">
              Novino.io reserves the right to amend these terms at any time. Changes take effect 
              once posted on the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-[#AE876D] mb-3">Governing Law and Jurisdiction</h2>
            <p className="text-gray-300 leading-relaxed">
              These terms are governed by Indian law, with disputes subject to the courts of Mumbai.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-[#444444]">
            <p className="text-gray-400 text-sm italic">
              Please review these terms regularly. Use of the site after changes constitutes acceptance.
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

