import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../../utils/validation';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    UserIcon,
    AtSymbolIcon,
    LockClosedIcon,
    CheckIcon
} from '@heroicons/react/24/solid';

const SignupForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(signupSchema)
    });

    const password = watch('password', '');

    const passwordStrength = (pass) => {
        let strength = 0;
        if (pass.length > 7) strength++;
        if (pass.match(/[A-Z]/)) strength++;
        if (pass.match(/[a-z]/)) strength++;
        if (pass.match(/[0-9]/)) strength++;
        if (pass.match(/[!@#$%^&*()]/)) strength++;
        return strength;
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.signup(data);
            toast.success('Registration Successful');
            navigate('/verify-otp', {
                state: {
                    userId: response.userId,
                    email: data.email
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center px-4 py-8">
            <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 space-y-6 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-500 rounded-full opacity-10"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-green-500 rounded-full opacity-10"></div>

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                    <p className="text-gray-500">Sign up to get started</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            {...register('username')}
                            placeholder="Username"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            {...register('email')}
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            {...register('password')}
                            placeholder="Password"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}

                        {/* Password Strength Indicator */}
                        <div className="mt-2 flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1 flex-1 rounded-full ${passwordStrength(password) >= level
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                        }`}
                                ></div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckIcon
                            className={`h-5 w-5 ${password.length >= 8 ? 'text-green-500' : 'text-gray-300'
                                }`}
                        />
                        <span>At least 8 characters</span>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            "Create Account"
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/login"
                            className="text-green-600 hover:text-green-800 font-semibold"
                        >
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;