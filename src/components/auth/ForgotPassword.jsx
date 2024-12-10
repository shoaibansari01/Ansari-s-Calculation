import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../../utils/validation';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.forgotPassword(data.email);

            // Store email in state for next step
            toast.success('Reset OTP sent to your email');
            navigate('/reset-password', {
                state: {
                    email: data.email,
                    userId: response.userId
                }
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password Reset Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {emailSent ? 'Check Your Email' : 'Forgot Password'}
                </h2>

                {!emailSent ? (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block mb-2 text-gray-700">Email Address</label>
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Enter your registered email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary-500 text-white py-2 rounded-md 
                  hover:bg-primary-600 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <div className="text-center">
                                <p className="text-gray-600">
                                    Remember your password?{' '}
                                    <a
                                        href="/login"
                                        className="text-primary-500 hover:underline"
                                    >
                                        Back to Login
                                    </a>
                                </p>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            <strong className="font-bold">Check Your Email!</strong>
                            <p>
                                We've sent a password reset link to {getValues('email')}
                            </p>
                        </div>
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-primary-500 hover:underline"
                        >
                            Try another email
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;