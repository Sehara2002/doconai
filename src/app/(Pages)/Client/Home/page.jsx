// Client/Home/page.jsx
"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle, ArrowRight, QrCode, FileText, Brain, Zap } from 'lucide-react';
import Header from '../../../Components/Common/Header';
import Footer from '../../../Components/Common/Footer';
import { redirect } from 'next/navigation';

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const tryfree = () => {
        redirect('/Pages/Signup'); // Redirect to the projects page
    }

    const features = [
        {
            title: "AI-Powered Analysis",
            description: "Advanced machine learning algorithms analyze construction documents with 99% accuracy",
            icon: <Brain className="w-8 h-8" />
        },
        {
            title: "Smart Search & Insights",
            description: "Find information faster with AI-powered search and automated insights generation",
            icon: <Zap className="w-8 h-8" />
        },
        {
            title: "Document Management",
            description: "Organize, categorize, and manage all your construction documents in one place",
            icon: <FileText className="w-8 h-8" />
        }
    ];

    const userStories = [
        "Reduced document review time by 75%",
        "Improved project accuracy and compliance",
        "Streamlined workflow for construction teams",
        "Enhanced collaboration across stakeholders"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50">
            <Header />

            {/* Hero Section - Mobile Optimized */}
            <section className="relative overflow-hidden min-h-screen md:h-screen flex items-center px-4 py-8 md:py-5">
                <div className="max-w-7xl mx-auto w-full mt-16 md:mt-10">
                    <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
                        {/* Left Content - Mobile Optimized */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
                            transition={{ duration: 0.8 }}
                            className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left"
                        >
                            <div className="space-y-4 md:space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center bg-blue-100 text-blue-800 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm font-medium shadow-sm"
                                >
                                    <Brain className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                    Free AI-Powered Construction Intelligence
                                </motion.div>

                                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-800 leading-tight tracking-tight px-2 lg:px-0">
                                    Revolutionize construction document management
                                </h1>

                                <h2 className="text-lg sm:text-xl lg:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 px-2 lg:px-0">
                                    with AI-powered analysis
                                </h2>

                                <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 px-2 lg:px-0">
                                    Transform your workflow with intelligent document analysis and automated insights.
                                </p>
                            </div>

                            {/* CTA Buttons - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 px-4 lg:px-0">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group w-full sm:w-auto"
                                    onClick={tryfree}
                                >
                                    Try for Free
                                    <ArrowRight className="ml-2 md:ml-3 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="border-2 border-slate-300 text-slate-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold text-base md:text-lg hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 flex items-center justify-center group w-full sm:w-auto"
                                >
                                    Explore More
                                    <ChevronRight className="ml-2 md:ml-3 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </div>

                            {/* Trust Indicators - Mobile Optimized */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-center lg:justify-start space-x-4 md:space-x-6 pt-4"
                            >
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-bold text-slate-800">100%</div>
                                    <div className="text-xs text-slate-600">Free Forever</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-bold text-slate-800">10K+</div>
                                    <div className="text-xs text-slate-600">Documents</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl md:text-2xl font-bold text-slate-800">99.5%</div>
                                    <div className="text-xs text-slate-600">Accuracy</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Side - Mobile Optimized */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="lg:col-span-5 mt-8 lg:mt-0 px-4 lg:px-0"
                        >
                            <div className="relative max-w-md mx-auto lg:max-w-none">
                                {/* Main Card - Mobile Optimized */}
                                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-slate-100 backdrop-blur-sm">
                                    <div className="space-y-3 md:space-y-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base md:text-lg font-semibold text-slate-800">AI Analysis</h3>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-green-600 font-medium">Processing</span>
                                            </div>
                                        </div>

                                        {/* Analysis Steps - Mobile Optimized */}
                                        <div className="space-y-2 md:space-y-3">
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1 }}
                                                className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg"
                                            >
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span className="text-xs md:text-sm text-slate-700">Blueprint analysis complete</span>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 1.5 }}
                                                className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg"
                                            >
                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span className="text-xs md:text-sm text-slate-700">Compliance check passed</span>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 2 }}
                                                className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg"
                                            >
                                                <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin flex-shrink-0"></div>
                                                <span className="text-xs md:text-sm text-slate-700">Generating insights...</span>
                                            </motion.div>
                                        </div>

                                        {/* Progress Bar - Mobile Optimized */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-600 font-medium">Progress</span>
                                                <span className="text-xs text-blue-600 font-semibold">87%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '87%' }}
                                                    transition={{ duration: 3, delay: 1, ease: "easeOut" }}
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Elements - Mobile Adjusted */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 2.5, duration: 0.5 }}
                                    className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-1.5 md:p-2 rounded-xl shadow-lg"
                                >
                                    <Brain className="w-3 h-3 md:w-4 md:h-4" />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 3, duration: 0.5 }}
                                    className="absolute -bottom-2 -left-2 md:-bottom-3 md:-left-3 bg-green-500 text-white p-1.5 md:p-2 rounded-xl shadow-lg"
                                >
                                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Background Decorations - Mobile Hidden */}
                <div className="absolute top-1/4 left-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 blur-3xl hidden md:block"></div>
                <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-cyan-200 rounded-full opacity-20 blur-3xl hidden md:block"></div>
            </section>

            {/* Features Section - Mobile Optimized */}
            <section className="py-12 md:py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-12 md:mb-16"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 px-4">
                            Powerful Features for Construction Teams
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
                            Experience the future of construction document management with our AI-powered platform
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: index * 0.2 }}
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4 md:mb-6 text-white mx-auto sm:mx-0">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-3 md:mb-4 text-center sm:text-left">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed text-center sm:text-left text-sm md:text-base">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* User Stories Section - Mobile Optimized */}
            <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-white text-center lg:text-left"
                        >
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                                Trusted by Construction Professionals
                            </h2>
                            <div className="space-y-3 md:space-y-4 max-w-lg mx-auto lg:max-w-none">
                                {userStories.map((story, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className="flex items-center space-x-3 justify-center lg:justify-start"
                                    >
                                        <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-cyan-200 flex-shrink-0" />
                                        <span className="text-base md:text-lg">{story}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 mt-8 lg:mt-0"
                        >
                            <div className="text-center text-white">
                                <h3 className="text-xl md:text-2xl font-semibold mb-4">Ready to Transform Your Workflow?</h3>
                                <p className="text-cyan-100 mb-6 text-sm md:text-base">
                                    Join thousands of construction professionals who trust our free AI-powered platform
                                </p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto w-full sm:w-auto justify-center"
                                    onClick={tryfree}
                                >
                                    Try for Free
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* QR Code Section - Mobile Optimized */}
            <section className="py-12 md:py-20 px-4 bg-slate-100">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left order-2 lg:order-1"
                        >
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-6">
                                Mobile Access
                            </h2>
                            <p className="text-lg md:text-xl text-slate-600 mb-6">
                                Access your construction documents anywhere with our mobile-optimized platform.
                                Scan documents on-site and get instant AI-powered analysis results.
                            </p>
                            <div className="space-y-3 md:space-y-4 max-w-lg mx-auto lg:max-w-none">
                                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                                    <QrCode className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
                                    <span className="text-slate-700 text-sm md:text-base">Instant mobile access</span>
                                </div>
                                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
                                    <span className="text-slate-700 text-sm md:text-base">Quick document scanning</span>
                                </div>
                                <div className="flex items-center space-x-3 justify-center lg:justify-start">
                                    <Brain className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
                                    <span className="text-slate-700 text-sm md:text-base">AI-powered analysis on-the-go</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="flex justify-center items-center order-1 lg:order-2"
                        >
                            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 mx-auto">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center mx-auto">
                                    <QrCode className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-slate-500" />
                                </div>
                                <p className="text-center text-slate-600 mt-4 font-medium text-sm md:text-base">
                                    Scan to access mobile version
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;