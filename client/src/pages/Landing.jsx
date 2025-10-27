import { Link } from 'react-router-dom';
import {
  Calculator as CalcIcon, Shield, Zap, TrendingUp, Activity,
} from 'lucide-react';

const Landing = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    {/* Navigation */}
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold">Web Calculator</span>
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>

    {/* Hero Section */}
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-purple-900/30 rounded-full">
            <CalcIcon className="w-20 h-20 text-purple-400" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Advanced Web Calculator
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          A powerful, feature-rich calculator supporting complex math, matrix operations,
          calculus, machine learning functions, and beautiful graph plotting.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 text-lg rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-semibold"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 text-lg rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
              <CalcIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Basic & Advanced Math</h3>
            <p className="text-gray-400">
              Perform basic arithmetic to advanced mathematical operations including
              trigonometry, logarithms, and exponential functions.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-pink-900/50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Matrix Operations</h3>
            <p className="text-gray-400">
              Full support for matrix mathematics including multiplication, addition,
              determinants, and transpose operations.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Graph Plotting</h3>
            <p className="text-gray-400">
              Visualize functions and complex numbers with interactive 2D and 3D
              graph plotting capabilities.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">ML & Calculus</h3>
            <p className="text-gray-400">
              Machine learning functions including sigmoid, ReLU, softmax, and
              calculus operations like derivatives and integrals.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-orange-900/50 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Complex Numbers</h3>
            <p className="text-gray-400">
              Complete support for complex number arithmetic, polar/rectangular
              conversions, and complex plane plotting.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-teal-900/50 rounded-lg flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">History Tracking</h3>
            <p className="text-gray-400">
              Keep track of all your calculations with persistent history that
              syncs across your devices.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-yellow-900/50 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
            <p className="text-gray-400">
              Your data is encrypted and secure. We prioritize your privacy with
              industry-standard security measures.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Fast & Responsive</h3>
            <p className="text-gray-400">
              Lightning-fast calculations with a responsive interface that works
              seamlessly on all devices.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of users who trust Web Calculator for their mathematical needs.
        </p>
        <Link
          to="/signup"
          className="inline-block px-8 py-4 text-lg rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-semibold"
        >
          Create Free Account
        </Link>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-800 border-t border-gray-700 py-8 px-4">
      <div className="max-w-7xl mx-auto text-center text-gray-400">
        <p>&copy; 2025 Web Calculator. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default Landing;
