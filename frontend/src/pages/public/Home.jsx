import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Zap, ArrowRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
        {/* Decorative background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
          Professional Equipment <br />
          <span className="text-primary-500">Rental, Simplified.</span>
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl">
          Manage inventory, track reservations, calculate dynamic pricing, and maintain machinery health in one production-ready system.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 font-semibold shadow-lg shadow-primary-900/30 transition duration-300"
          >
            <span>Access Portal</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-900 font-semibold transition duration-300"
          >
            Documentation
          </a>
        </div>
      </div>

      {/* Feature Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="p-3 w-fit rounded-lg bg-primary-500/10 text-primary-500 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Role-Based Workspaces</h3>
            <p className="mt-2 text-slate-400 text-sm">
              Custom dashboard experiences designed specifically for Admins, Staff clerks, and renting Customers.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="p-3 w-fit rounded-lg bg-accent-500/10 text-accent-500 mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Atomic Booking Engine</h3>
            <p className="mt-2 text-slate-400 text-sm">
              ACID compliant transaction layers that absolutely prevent double-booking or rental scheduling conflicts.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="p-3 w-fit rounded-lg bg-emerald-500/10 text-emerald-500 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Billing & Invoicing</h3>
            <p className="mt-2 text-slate-400 text-sm">
              Integrated payments, security deposit handling, dynamic late-fee logs, and auto-generated PDF invoices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
