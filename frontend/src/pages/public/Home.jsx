import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Calendar, Zap, ArrowRight, Package, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 80, damping: 20, mass: 1 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const TypewriterText = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    let timeout;
    
    // Smooth, slightly randomized typing speed for an organic feel
    const typingSpeed = Math.floor(Math.random() * 40) + 50; // 50-90ms
    const deletingSpeed = 25; // Fast, consistent delete
    
    if (!isDeleting && displayText.length < text.length) {
      timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, typingSpeed);
    } else if (isDeleting && displayText.length > 0) {
      timeout = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length - 1));
      }, deletingSpeed);
    } else if (!isDeleting && displayText.length === text.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2500);
    } else if (isDeleting && displayText.length === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 800);
    }
    
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, text]);

  return (
    <span className="inline-flex items-center min-h-[1.5em]">
      {displayText}
      <motion.span 
        animate={{ opacity: [1, 0, 1] }} 
        transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
        className="w-[2px] h-[1.1em] bg-orange-500 ml-[4px]"
      />
    </span>
  );
};

const Home = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100">

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] sm:min-h-[92vh] flex flex-col items-center justify-center text-center px-2 pt-24 sm:pt-0 overflow-hidden">

        {/* Grid overlay */}
        <div className="absolute inset-0 hero-grid pointer-events-none" />

        {/* Floating ambient orbs */}
        <div className="absolute top-[-120px] left-[-100px] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[130px] pointer-events-none animate-float" />
        <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] bg-orange-400/8 rounded-full blur-[110px] pointer-events-none animate-float-rev" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div 
          className="relative z-10 max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Headline */}
          <motion.h1 variants={fadeInUp} className="text-[42px] leading-[1.1] sm:text-7xl font-black tracking-tighter sm:leading-[1.05] mb-3 sm:mb-6">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Complete Rental Management</span>
            <span className="block text-primary-500">
               Platform
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p variants={fadeInUp} className="text-[10px] sm:text-sm text-slate-300 font-light tracking-wide max-w-2xl mx-auto leading-snug sm:leading-relaxed mb-6 sm:mb-10 px-2 sm:px-0">
where customers can explore available items, book what they need, and manage their rentals, while businesses can manage inventory, bookings, returns, availability, and payments, all in one place.
          </motion.p>

          {/* Typewriter Text */}
          <motion.div variants={fadeInUp} className="mb-6 sm:mb-8 flex items-center justify-center gap-2 sm:gap-5 text-[10px] sm:text-sm font-bold uppercase tracking-widest sm:tracking-[0.15em] text-slate-300 whitespace-nowrap overflow-hidden w-full max-w-full px-2">
            <span className="w-3 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-orange-500/50 shrink-0"></span>
            <span className="shrink-0"><TypewriterText text="Rent Anything. Manage Everything." /></span>
            <span className="w-3 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-orange-500/50 shrink-0"></span>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp} className="flex flex-row flex-nowrap items-center justify-center gap-2 sm:gap-4 mb-28 sm:mb-40">
            {/* Primary CTA */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-xl blur opacity-50 group-hover:opacity-80 transition-all duration-500" />
              <Link
                to="/register"
                className="relative flex items-center justify-center shrink-0 flex-nowrap gap-1.5 sm:gap-2.5 px-1.5 py-3 sm:px-4 sm:py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[13px] sm:text-base tracking-wide shadow-xl shadow-orange-900/40 transition-all duration-200 active:scale-95 overflow-hidden group/btn"
              >
                <span className="absolute inset-0 w-[40%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent animate-btn-shine pointer-events-none" />
                <span className="relative z-10 flex items-center shrink-0 flex-nowrap gap-1 sm:gap-2">
                  <span className="whitespace-nowrap">Get&nbsp;Started&nbsp;Free</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5 shrink-0 group-hover/btn:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            </div>

            {/* Ghost CTA */}
            <Link
              to="/login"
              className="group flex items-center justify-center shrink-0 flex-nowrap gap-1.5 sm:gap-2.5 px-3 py-3 sm:px-8 sm:py-3.5 rounded-xl bg-white/5 hover:bg-orange-500/10 text-slate-300 hover:text-orange-500 font-semibold text-[13px] sm:text-base backdrop-blur-md border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-black/20"
            >
              <span className="whitespace-nowrap">Sign&nbsp;in&nbsp;to&nbsp;Portal</span>
            </Link>
          </motion.div>

          {/* Social proof bar */}
          <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-slate-300">
            {[
              { icon: Package, text: '500+ Items Listed' },
              { icon: Users, text: '1,200+ Happy Customers' },
              { icon: TrendingUp, text: '98% Satisfaction Rate' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 sm:gap-2">
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500/70" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
      </section>

      {/* ── FEATURE SECTION ──────────────────────────────────────────────── */}
      <section className="relative pt-4 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Section header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-14"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-5">
              <div className="h-px w-6 sm:w-12 bg-gradient-to-r from-transparent to-orange-500/60"></div>
              <span className="text-[10px] sm:text-sm font-bold uppercase tracking-widest sm:tracking-[0.25em] bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500 whitespace-nowrap">
                Why RentAll Platform
              </span>
              <div className="h-px w-6 sm:w-12 bg-gradient-to-l from-transparent to-orange-500/60"></div>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              <span className="text-slate-100">
                Everything you need,
              </span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                nothing you don't.
              </span>
            </h2>
          </motion.div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                gradient: 'from-orange-500/15',
                border: 'border-orange-700/30',
                iconBg: 'bg-orange-500/10 border-orange-700/40',
                iconColor: 'text-orange-400',
                title: 'Role-Based Workspaces',
                desc: 'Custom dashboard experiences designed for Admins, Staff, and Customers — each with the right tools and permissions.',
              },
              {
                icon: Calendar,
                gradient: 'from-blue-500/10',
                border: 'border-blue-700/20',
                iconBg: 'bg-blue-500/10 border-blue-700/40',
                iconColor: 'text-blue-400',
                title: 'Atomic Booking Engine',
                desc: 'ACID-compliant reservation layers that completely prevent double-bookings and scheduling conflicts.',
              },
              {
                icon: Zap,
                gradient: 'from-emerald-500/10',
                border: 'border-emerald-700/20',
                iconBg: 'bg-emerald-500/10 border-emerald-700/40',
                iconColor: 'text-emerald-400',
                title: 'Billing & Invoicing',
                desc: 'Integrated deposits, dynamic late-fee tracking, and auto-generated PDF invoices in one seamless flow.',
              },
            ].map(({ icon: Icon, gradient, border, iconBg, iconColor, title, desc }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ 
                  opacity: 1, 
                  x: 0,
                  transition: { 
                    duration: 0.4, 
                    ease: 'easeOut',
                    delay: index * 0.1 
                  } 
                }}
                viewport={{ once: true, amount: 0.2 }}
                className={`group relative bg-gradient-to-b ${gradient} to-transparent bg-slate-900/80 border ${border} rounded-2xl p-7 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 overflow-hidden backdrop-blur-sm`}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className={`relative p-3 w-fit rounded-xl ${iconBg} border mb-5 ${iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`relative text-lg font-bold mb-2 ${iconColor}`}>{title}</h3>
                <p className="relative text-slate-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
