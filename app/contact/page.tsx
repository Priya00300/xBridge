"use client"

import type React from "react"

import { useState } from "react"
import FloatingSymbols from "@/components/floating-symbols"
import { Mail, Send, MapPin, Phone } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would go here
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#09122C] to-black relative overflow-hidden pt-20">
      <FloatingSymbols />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-[#BE3144] mb-10 text-center">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-white mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#BE3144] text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#BE3144] text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="subject" className="block text-white mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#BE3144] text-white"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-white mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:border-[#BE3144] text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#BE3144] hover:bg-[#9e2938] text-white py-3 px-4 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </button>
            </form>
          </div>

          <div className="flex flex-col">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#BE3144]/20 flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-[#BE3144]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Email</h3>
                    <p className="text-white/70">shyamjaiswal9892@gmail.com</p>
                    <p className="text-white/70">https://x.com/NovaLynx7?t=wPs1cfbYwA-BOYa5WKGR6w&s=09</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#BE3144]/20 flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-[#BE3144]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Office</h3>
                    <p className="text-white/70">SRM UNIVERSITY</p>
                    <p className="text-white/70">SRM INSTITUTE OF SCIENCE AND TECHNOLOGY,KTR CHENNAI,INDIA</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-[#BE3144]/20 flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-[#BE3144]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Phone</h3>
                    <p className="text-white/70">(91+) 6386061984</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 flex-1">
              <h2 className="text-2xl font-bold text-white mb-6">FAQ</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-2">What is xBridge?</h3>
                  <p className="text-white/70">
                    xBridge is a platform that allows you to swap and bridge tokens across multiple blockchain networks.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">How do I connect my wallet?</h3>
                  <p className="text-white/70">
                    Click on the "Connect Wallet" button in the top right corner and select your preferred wallet
                    provider.
                  </p>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-2">Is there a fee for using xBridge?</h3>
                  <p className="text-white/70">
                    Yes, there is a small fee for each transaction to cover network costs and maintain the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

