import React from 'react';
import { motion } from 'framer-motion';

const LegalPageLayout = ({ title, lastUpdated, children }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 lg:px-8 text-slate-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-slate-500 mb-10 text-sm font-medium tracking-wide">
          Last Updated: {lastUpdated}
        </p>

        <div className="space-y-8 text-slate-400 leading-relaxed">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export const PrivacyPolicy = () => (
  <LegalPageLayout title="Privacy Policy" lastUpdated="August 12, 2024">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. Information We Collect</h2>
      <p>We collect information you provide directly to us when you create an account, update your profile, or interact with our services. This includes your name, email address, phone number, and billing information.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. How We Use Information</h2>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications, and communicate with you about your account and rentals.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">3. Data Security</h2>
      <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>
    </section>
  </LegalPageLayout>
);

export const TermsConditions = () => (
  <LegalPageLayout title="Terms & Conditions" lastUpdated="September 1, 2024">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. Acceptance of Terms</h2>
      <p>By accessing and using our equipment rental services, you agree to be bound by these Terms and Conditions.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. Rental Agreement</h2>
      <p>All equipment rentals are subject to availability and our approval. The renter is responsible for the equipment from the time of delivery/pickup until it is returned and inspected.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">3. Liability and Damages</h2>
      <p>The renter assumes all risks associated with the use of the equipment. Any damages incurred during the rental period will be charged to the renter's account.</p>
    </section>
  </LegalPageLayout>
);

export const RefundPolicy = () => (
  <LegalPageLayout title="Refund Policy" lastUpdated="July 15, 2024">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. Cancellation by Customer</h2>
      <p>Cancellations made 48 hours prior to the rental start date are eligible for a full refund. Cancellations made within 48 hours may be subject to a cancellation fee of 20%.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. Defective Equipment</h2>
      <p>If you receive defective equipment, please notify us immediately. We will arrange a replacement or provide a full refund for the rental period affected.</p>
    </section>
  </LegalPageLayout>
);

export const CookiePolicy = () => (
  <LegalPageLayout title="Cookie Policy" lastUpdated="January 10, 2024">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. What are Cookies?</h2>
      <p>Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and understand how you use our site.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. How We Use Cookies</h2>
      <p>We use essential cookies to keep you logged in and functional cookies to remember your preferences (such as dark mode). We may also use analytics cookies to improve our services.</p>
    </section>
  </LegalPageLayout>
);

export const AdminPolicies = () => (
  <LegalPageLayout title="Administrative Policies" lastUpdated="May 20, 2024">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. Internal Access</h2>
      <p>Administrative access is strictly restricted to authorized personnel. All actions within the administrative dashboard are logged and monitored.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. Data Handling</h2>
      <p>Customer data must not be exported or shared outside of the platform without explicit authorization from the compliance officer.</p>
    </section>
  </LegalPageLayout>
);

export const AdminSecurity = () => (
  <LegalPageLayout title="Security Overview" lastUpdated="October 5, 2024">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. Infrastructure Security</h2>
      <p>Our infrastructure is hosted on secure cloud providers with DDoS protection, firewalls, and regular vulnerability scanning.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. Authentication</h2>
      <p>We utilize JWT (JSON Web Tokens) for secure, stateless authentication. Passwords are securely hashed using bcrypt.</p>
    </section>
  </LegalPageLayout>
);

export const AdminApiDocs = () => (
  <LegalPageLayout title="API Documentation" lastUpdated="Current">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">1. REST API</h2>
      <p>Our RESTful API endpoints are documented using Swagger. To view the full API specifications, please navigate to the `/api/docs` route on the backend server.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">2. Rate Limiting</h2>
      <p>All API requests are subject to rate limiting to ensure platform stability. Current limit: 100 requests per minute per IP.</p>
    </section>
  </LegalPageLayout>
);

export const AdminSystemStatus = () => (
  <LegalPageLayout title="System Status" lastUpdated="Live">
    <section>
      <h2 className="text-xl font-bold text-slate-200 mb-3">All Systems Operational</h2>
      <p>Our core database, authentication services, and asset delivery networks are currently operating at 100% capacity with no reported incidents.</p>
    </section>
  </LegalPageLayout>
);
