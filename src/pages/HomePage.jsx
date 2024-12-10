import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col">
            {/* Navigation */}
            <nav className="px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-primary-700">AuthApp</div>
                <div className="space-x-4">
                    <Link
                        to="/login"
                        className="px-4 py-2 text-primary-700 hover:bg-primary-100 rounded-md transition"
                    >
                        Login
                    </Link>
                    <Link
                        to="/signup"
                        className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow container mx-auto px-6 grid md:grid-cols-2 items-center gap-10 py-16">
                {/* Left Content */}
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary-800 leading-tight">
                        Secure Authentication <br />Made Simple
                    </h1>

                    <p className="text-gray-600 text-lg">
                        A modern, secure authentication system with OTP verification,
                        password reset, and robust security features.
                    </p>

                    <div className="flex space-x-4">
                        <Link
                            to="/signup"
                            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center"
                        >
                            Get Started
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 ml-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-3 border border-primary-500 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>

                {/* Right Content - Illustration/Graphic */}
                <div className="hidden md:flex justify-center items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 400 300"
                        className="w-full max-w-md"
                    >
                        {/* Security Lock Illustration */}
                        <path
                            d="M200 50c-82.84 0-150 67.16-150 150s67.16 150 150 150 150-67.16 150-150S282.84 50 200 50zm0 240c-49.63 0-90-40.37-90-90s40.37-90 90-90 90 40.37 90 90-40.37 90-90 90z"
                            fill="#3B82F6"
                        />
                        <path
                            d="M200 120c-44.18 0-80 35.82-80 80s35.82 80 80 80 80-35.82 80-80-35.82-80-80-80zm0 130c-27.61 0-50-22.39-50-50s22.39-50 50-50 50 22.39 50 50-22.39 50-50 50z"
                            fill="#1E40AF"
                        />
                        <circle cx="200" cy="200" r="30" fill="#60A5FA" />
                    </svg>
                </div>
            </main>

            {/* Features Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12 text-primary-800">
                        Key Features
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Secure Authentication",
                                description: "Multi-factor authentication with OTP verification.",
                                icon: "🔒"
                            },
                            {
                                title: "Easy Password Reset",
                                description: "Simple and secure password recovery process.",
                                icon: "🔑"
                            },
                            {
                                title: "User Management",
                                description: "Robust user registration and profile management.",
                                icon: "👤"
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-primary-50 p-6 rounded-lg text-center hover:shadow-md transition"
                            >
                                <div className="text-5xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2 text-primary-800">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary-800 text-white py-6">
                <div className="container mx-auto px-6 text-center">
                    <p>© 2024 AuthApp. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;