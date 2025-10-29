/*
  Landing

  Purpose:
  Minimal landing page that redirects authenticated users to their dashboard
  and presents login/signup links for unauthenticated visitors.

  Features:
  - Hero section with app introduction
  - Feature showcase (ML, Matrix, Calculus, etc.)
  - Call-to-action buttons for signup/login

  Parameters/Return:
  No props; returns a landing page React element.
*/

import { Link } from 'react-router-dom';
import {
  Calculator as CalcIcon, Shield, Zap, TrendingUp, Activity, Sparkles,
} from 'lucide-react';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white overflow-hidden transition-colors duration-300">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-tl from-cyan-500/20 via-blue-600/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10 bg-gradient-to-r from-slate-900/80 via-indigo-900/80 to-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl">
                  <CalcIcon className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  Web Calculator
                </h1>
                <p className="text-xs text-slate-400">Advanced Computing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-white/10 transition-all duration-300 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="group relative px-6 py-2.5 rounded-xl font-medium overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative text-white">Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-3xl blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-3xl backdrop-blur-xl border border-white/10">
                <CalcIcon className="w-24 h-24 text-violet-400" />
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Advanced Web Calculator
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            A powerful, feature-rich calculator supporting complex math, matrix operations,
            calculus, machine learning functions, and beautiful graph plotting.
          </p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Experience the future of mathematical computing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="group relative px-8 py-4 text-lg rounded-2xl font-semibold overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative text-white flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" />
                Get Started Free
              </span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-lg rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-white/10 transition-all duration-300 font-semibold backdrop-blur-xl"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-slate-400 text-lg">Everything you need for advanced mathematical computing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <CalcIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Basic & Advanced Math</h3>
                <p className="text-slate-400 leading-relaxed">
                  Perform basic arithmetic to advanced mathematical operations including
                  trigonometry, logarithms, and exponential functions.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Matrix Operations</h3>
                <p className="text-slate-400 leading-relaxed">
                  Full support for matrix mathematics including multiplication, addition,
                  determinants, and transpose operations.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Graph Plotting</h3>
                <p className="text-slate-400 leading-relaxed">
                  Visualize functions and complex numbers with interactive 2D and 3D
                  graph plotting capabilities.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">ML & Calculus</h3>
                <p className="text-slate-400 leading-relaxed">
                  Machine learning functions including sigmoid, ReLU, softmax, and
                  calculus operations like derivatives and integrals.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Complex Numbers</h3>
                <p className="text-slate-400 leading-relaxed">
                  Complete support for complex number arithmetic, polar/rectangular
                  conversions, and complex plane plotting.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">History Tracking</h3>
                <p className="text-slate-400 leading-relaxed">
                  Keep track of all your calculations with persistent history that
                  syncs across your devices.
                </p>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure & Private</h3>
                <p className="text-slate-400 leading-relaxed">
                  Your data is encrypted and secure. We prioritize your privacy with
                  industry-standard security measures.
                </p>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast & Responsive</h3>
                <p className="text-slate-400 leading-relaxed">
                  Lightning-fast calculations with a responsive interface that works
                  seamlessly on all devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-cyan-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-xl p-12 rounded-3xl border border-white/10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Join thousands of users who trust Web Calculator for their mathematical needs.
              </p>
              <Link
                to="/signup"
                className="group relative inline-block px-10 py-4 text-lg rounded-2xl font-semibold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-transform group-hover:scale-105"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative text-white">Create Free Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-900/50 backdrop-blur-xl py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">&copy; 2025 Web Calculator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;