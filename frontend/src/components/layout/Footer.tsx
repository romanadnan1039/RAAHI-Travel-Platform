import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#2E3800] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'LEMON MILK, sans-serif' }}>
              RAAHI
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Your Gateway to Pakistan's Most Beautiful Destinations
            </p>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              TRAVEL | EXPLORE | DISCOVER
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/packages" className="hover:text-[#FFFAC3] transition-colors">
                  Browse Packages
                </Link>
              </li>
              <li>
                <Link to="/login/user" className="hover:text-[#FFFAC3] transition-colors">
                  User Login
                </Link>
              </li>
              <li>
                <Link to="/login/agency" className="hover:text-[#FFFAC3] transition-colors">
                  Agency Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Email: support@raahi.com</li>
              <li>Phone: +92-300-1234567</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#41491D] mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 RAAHI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
