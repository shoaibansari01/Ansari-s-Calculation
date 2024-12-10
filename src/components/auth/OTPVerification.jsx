import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { otpSchema } from '../../utils/validation';
import { authService } from '../../services/authService';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    // Get userId from navigation state
    const userId = location.state?.userId;
    const email = location.state?.email;

    if (!userId) {
        navigate('/signup');
    }

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(otpSchema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await authService.verifyOTP({
                userId,
                otp: data.otp
            });

            toast.success('Account Verified Successfully');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP Verification Failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Verify OTP</h2>
                <p className="text-center mb-4 text-gray-600">
                    Enter the 6-digit OTP sent to {email}
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block mb-2">OTP</label>
                        <input
                            {...register('otp')}
                            type="text"
                            maxLength="6"
                            className="w-full px-3 py-2 border rounded-md text-center tracking-[10px] font-bold"
                            placeholder="Enter 6-digit OTP"
                        />
                        {errors.otp && (
                            <p className="text-red-500 text-sm mt-1 text-center">
                                {errors.otp.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition-colors"
                    >
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Didn't receive the OTP?{' '}
                            <button
                                type="button"
                                className="text-primary-500 hover:underline"
                                onClick={() => {
                                    // Implement resend OTP logic
                                    toast.success('OTP Resent Successfully');
                                }}
                            >
                                Resend OTP
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPVerification;