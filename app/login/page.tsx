"use client"

import { motion } from "framer-motion"
import { Navigation } from "@/components/navigation"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <LoginForm />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
