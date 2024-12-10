import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const [netProfitData, setNetProfitData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Format date to more readable format
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format currency to Indian Rupees
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleAddColumnEntry = () => {
        navigate('/column-entry');
    };

    useEffect(() => {
        const fetchNetProfitSummary = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                console.log('Stored user in localStorage:', storedUser);

                const userId = authService.getCurrentUserId();
                console.log('Extracted User ID:', userId);

                if (!userId) {
                    toast.error('Unable to retrieve user ID');
                    return;
                }

                const response = await authService.getNetProfitSummary(userId);
                setNetProfitData(response);
                setIsLoading(false);
            } catch (error) {
                console.error('Full error details:', error.response || error);
                toast.error('Failed to fetch net profit summary');
                setIsLoading(false);
            }
        };

        fetchNetProfitSummary();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-4xl relative">
                {/* Add Column Entry Button */}
                <button
                    onClick={handleAddColumnEntry}
                    className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Add Column Entry"
                >
                    <PlusCircle size={32} />
                </button>

                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Dashboard</h1>

                {/* User Info Section */}
                <div className="text-center mb-6">
                    <p className="text-lg md:text-xl mb-2">Welcome, <strong className="text-blue-600">{user.username}</strong>!</p>
                    <p className="text-gray-600 text-sm md:text-base">Email: {user.email}</p>
                </div>

                {/* Net Profit Summary */}
                {isLoading ? (
                    <div className="text-center text-gray-500">Loading profit summary...</div>
                ) : netProfitData ? (
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Profit Overview</h2>

                        {/* Overall Summary */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
                            <div className="bg-blue-100 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Total Investment</p>
                                <p className="font-bold text-blue-800">
                                    {formatCurrency(netProfitData.overallSummary.totalColumnValue)}
                                </p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Total Profit</p>
                                <p className="font-bold text-green-800">
                                    {formatCurrency(netProfitData.overallSummary.totalProfit)}
                                </p>
                            </div>
                            <div className="bg-purple-100 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Net Profit</p>
                                <p className="font-bold text-purple-800">
                                    {formatCurrency(netProfitData.overallSummary.netProfit)}
                                </p>
                            </div>
                        </div>

                        {/* Daily Breakdown */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-center text-gray-700">Daily Breakdown</h3>
                            <div className="space-y-2">
                                {netProfitData.dailyNetProfit.map((day, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                                    >
                                        <div className="mb-2 sm:mb-0">
                                            <p className="font-medium text-gray-700">
                                                {formatDate(day.date)}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-sm text-gray-600">
                                                Investment: {formatCurrency(day.totalColumnValue)}
                                            </p>
                                            <p className="text-sm text-green-600">
                                                Profit: {formatCurrency(day.totalProfit)}
                                            </p>
                                            <p className="font-bold text-purple-700">
                                                Net Profit: {formatCurrency(day.netProfit)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500">No profit data available</div>
                )}

                {/* Logout Button */}
                <div className="text-center mt-6">
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
