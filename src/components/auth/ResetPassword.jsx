import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '../../utils/validation';
import { authService } from '../../services/authService';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // Get email and userId from navigation state
    const userId = location.state?.userId;
    const email = location.state?.email;

    if (!userId || !email) {
        navigate('/forgot-password');
    }

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await authService.resetPassword({
                userId,
                otp: data.otp,
                newPassword: data.newPassword
            });

            toast.success('Password Reset Successfully');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Password Reset Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

                <p className="text-center mb-4 text-gray-600">
                    Enter the OTP sent to {email}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-gray-700">OTP</label>
                        <input
                            type="text"
                            {...register('otp')}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                        />
                        {errors.otp && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.otp.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-gray-700">New Password</label>
                        <input
                            type="password"
                            {...register('newPassword')}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter new password"
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.newPassword.message}
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
                            {isLoading ? 'Resetting...' : 'Reset Password'}
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
            </div>
        </div>
    );
};

export default ResetPassword;