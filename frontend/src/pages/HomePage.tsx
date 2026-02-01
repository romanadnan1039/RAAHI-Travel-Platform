import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFFAC3]/30 flex flex-col">
      <Navbar />

          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                Welcome to RAAHI
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8">
                Your Gateway to Pakistan's Most Beautiful Destinations
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/packages"
                  className="w-full sm:w-auto bg-[#566614] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#6E6B40] transition-colors shadow-lg hover:shadow-xl"
                >
                  Browse Packages
                </Link>
                <Link
                  to="/login/user"
                  className="w-full sm:w-auto bg-white text-[#566614] px-8 py-3 rounded-lg text-lg font-semibold border-2 border-[#566614] hover:bg-[#FFFAC3]/50 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="mt-12 sm:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                  Explore Destinations
                </h3>
                <p className="text-gray-600">
                  Discover amazing travel packages to Hunza, Swat, Naran, Skardu, and more
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                  AI Travel Assistant
                </h3>
                <p className="text-gray-600">
                  Get personalized recommendations using our intelligent travel assistant
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
                  Easy Booking
                </h3>
                <p className="text-gray-600">
                  Book your dream vacation with just a few clicks
                </p>
              </div>
            </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Already have an account?</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login/user"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              User Login →
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/login/agency"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Agency Login →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
