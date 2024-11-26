'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, LineChart, PieChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-white"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
            Analytics Dashboard
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
            Transform your business data into actionable insights with our powerful analytics platform
          </p>
          <Link href="/auth/login">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100 hover:scale-105 transform transition-all duration-200 font-semibold"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition-all duration-300"
          >
            <BarChart2 className="h-12 w-12 mb-4 text-indigo-300" />
            <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-gray-200">Monitor your metrics in real-time with interactive dashboards</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition-all duration-300"
          >
            <LineChart className="h-12 w-12 mb-4 text-indigo-300" />
            <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
            <p className="text-gray-200">Identify patterns and trends with advanced visualization tools</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white hover:bg-white/20 transition-all duration-300"
          >
            <PieChart className="h-12 w-12 mb-4 text-indigo-300" />
            <h3 className="text-xl font-semibold mb-2">Custom Reports</h3>
            <p className="text-gray-200">Generate detailed reports tailored to your business needs</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
