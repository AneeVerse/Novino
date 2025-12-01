"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, MapPin, Phone } from "lucide-react";
import Footer from "@/components/footer";

export default function ContactPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            toast({
                title: "Message Sent",
                description: "Thank you for contacting us. We will get back to you soon.",
            });

            setFormData({
                name: "",
                email: "",
                subject: "",
                message: "",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send message",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#2D2D2D] text-white">
            {/* Header Section */}
            <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/hero-section/HERO.jpg')" }}
                />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-5xl md:text-7xl font-dm-serif-display mb-4">Contact Us</h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light">
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Contact Information */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-dm-serif-display mb-6 text-[#E8B08A]">Get in Touch</h2>
                            <p className="text-gray-300 leading-relaxed mb-8">
                                Have questions about our art collection, shipping, or custom orders?
                                Our team is here to help you find the perfect piece for your space.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="bg-[#E8B08A]/10 p-3 rounded-full">
                                    <Mail className="w-6 h-6 text-[#E8B08A]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-1">Email</h3>
                                    <p className="text-gray-400">team.novino@gmail.com</p>
                                  
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#E8B08A]/10 p-3 rounded-full">
                                    <Phone className="w-6 h-6 text-[#E8B08A]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-1">Phone</h3>
                                    <p className="text-gray-400">+91 8655644869</p>
                                    <p className="text-gray-500 text-sm">(Mon-Fri, 9am - 6pm IST)</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-[#E8B08A]/10 p-3 rounded-full">
                                    <MapPin className="w-6 h-6 text-[#E8B08A]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-1">Office</h3>
                                    <p className="text-gray-400">
                                        NOVINO INK ARTS (OPC) Pvt Ltd<br />
                                        Office No.607, Mayuresh Cosmos<br />
                                        Sec - 11, Plot No. 37, CBD Belapur<br />
                                        Navi Mumbai - 400 614<br />
                                        Maharashtra, India
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-[#363636] p-8 md:p-10 rounded-2xl shadow-xl border border-white/5">
                        <h2 className="text-2xl font-dm-serif-display mb-6">Send Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                                    Your Name
                                </label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="bg-[#2D2D2D] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E8B08A] focus:ring-[#E8B08A]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                    className="bg-[#2D2D2D] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E8B08A] focus:ring-[#E8B08A]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-300">
                                    Subject
                                </label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="Inquiry about..."
                                    className="bg-[#2D2D2D] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E8B08A] focus:ring-[#E8B08A]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-300">
                                    Message
                                </label>
                                <Textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    placeholder="How can we help you?"
                                    className="min-h-[150px] bg-[#2D2D2D] border-white/10 text-white placeholder:text-gray-500 focus:border-[#E8B08A] focus:ring-[#E8B08A]"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#E8B08A] hover:bg-[#d99f76] text-black font-medium py-6 text-lg transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Message"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer wrapped in container to align with navbar */}
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <Footer />
            </div>
        </main>
    );
}
