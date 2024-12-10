import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { PlusCircle, X, Save, Calendar, IndianRupee, ListPlus, ArrowLeft } from 'lucide-react';

// Custom Card Component
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = "" }) => (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = "" }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

function ColumnEntry() {
    const [columns, setColumns] = useState([]);
    const [entries, setEntries] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [weeklyProfitEntries, setWeeklyProfitEntries] = useState([]);
    const [profitAmount, setProfitAmount] = useState('');
    const [profitDescription, setProfitDescription] = useState('');
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnUnit, setNewColumnUnit] = useState('');
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [netProfitData, setNetProfitData] = useState(null);

    useEffect(() => {
        fetchColumns()
        fetchWeeklyProfitEntries()
    }, [])

    useEffect(() => {
        fetchWeeklyProfitEntries()
    }, [selectedDate])

    const handleBack = () => {
        window.history.back();
    };

    const fetchNetProfitSummary = async () => {
        try {
            const userString = localStorage.getItem('user');
            if (!userString) {
                toast.error('User ID not found');
                return;
            }

            // Parse the user object from localStorage
            const user = JSON.parse(userString);
            const userId = user.id; // Extract just the id field

            const data = await authService.getNetProfitSummary(userId)
            const selectedDateData = data.dailyNetProfit.find(
                item => item.date === selectedDate
            )
            setNetProfitData(selectedDateData || null)
        } catch (error) {
            console.error('Error fetching net profit:', error);
            toast.error('Failed to fetch net profit data')
        }
    }

    const fetchColumns = async () => {
        try {
            const data = await authService.getAllUserColumns()
            setColumns(data.columns)
        } catch (error) {
            toast.error('Failed to fetch columns')
        }
    }

    const fetchWeeklyProfitEntries = async () => {
        try {
            const { entries } = await authService.getWeeklyProfitEntries({
                startDate: selectedDate,
                endDate: selectedDate
            })
            setWeeklyProfitEntries(entries)
        } catch (error) {
            toast.error('Failed to fetch profit entries')
        }
    }

    const handleValueChange = (columnName, value) => {
        setEntries(prev => ({
            ...prev,
            [columnName]: value
        }))
    }

    const handleAddColumn = async (e) => {
        e.preventDefault()
        if (!newColumnName.trim()) {
            toast.error('Column name is required')
            return
        }

        setIsAddingColumn(true)
        try {
            await authService.addColumnEntry({
                columnName: newColumnName.trim(),
                value: 0,
                date: selectedDate,
                unit: newColumnUnit.trim()
            })

            toast.success('Column added successfully')
            setNewColumnName('')
            setNewColumnUnit('')
            setShowAddColumn(false)
            fetchColumns()
        } catch (error) {
            console.error('Error adding column:', error)
            toast.error('Failed to add column')
        } finally {
            setIsAddingColumn(false)
        }
    }

    const handleSubmit = async () => {
        try {
            const promises = Object.entries(entries).map(([columnName, value]) =>
                authService.addColumnEntry({
                    columnName,
                    value: Number(value),
                    date: selectedDate
                })
            )

            await Promise.all(promises)
            await fetchNetProfitSummary() // Fetch net profit after submitting entries
            toast.success('Entries added successfully')
            setEntries({})
            fetchColumns()
        } catch (error) {
            toast.error('Failed to add entries')
        }
    }

    const handleAddProfitEntry = async () => {
        try {
            await authService.addWeeklyProfitEntry({
                date: selectedDate,
                amount: Number(profitAmount),
                description: profitDescription
            })
            toast.success('Profit entry added successfully')
            setProfitAmount('')
            setProfitDescription('')
            fetchWeeklyProfitEntries()
            fetchNetProfitSummary() // Fetch updated net profit after adding profit entry
        } catch (error) {
            toast.error('Failed to add profit entry')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Business Tracker</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Date Selection Card */}
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Select Date</h2>
                                <Calendar className="h-5 w-5 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </CardContent>
                        </Card>

                        {/* Columns Management Card */}
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Columns</h2>
                                <button
                                    onClick={() => setShowAddColumn(!showAddColumn)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                >
                                    {showAddColumn ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
                                    <span>{showAddColumn ? 'Cancel' : 'Add Column'}</span>
                                </button>
                            </CardHeader>
                            <CardContent>
                                {showAddColumn && (
                                    <form onSubmit={handleAddColumn} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Column Name*</label>
                                                <input
                                                    type="text"
                                                    value={newColumnName}
                                                    onChange={(e) => setNewColumnName(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter column name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={newColumnUnit}
                                                    onChange={(e) => setNewColumnUnit(e.target.value)}
                                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., kg, pieces"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isAddingColumn || !newColumnName.trim()}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                                            >
                                                <ListPlus className="h-4 w-4" />
                                                {isAddingColumn ? 'Creating...' : 'Create Column'}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                <div className="space-y-4">
                                    {columns.map((column) => (
                                        <div key={column.columnName} className="flex flex-col sm:flex-row sm:items-center gap-2">
                                            <label className="min-w-[150px] text-sm font-medium text-gray-700">
                                                {column.columnName} {column.unit && `(${column.unit})`}
                                            </label>
                                            <input
                                                type="number"
                                                value={entries[column.columnName] || ''}
                                                onChange={(e) => handleValueChange(column.columnName, e.target.value)}
                                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                                placeholder={`Enter value`}
                                            />
                                        </div>
                                    ))}

                                    {columns.length > 0 && (
                                        <button
                                            onClick={handleSubmit}
                                            disabled={Object.keys(entries).length === 0}
                                            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                                        >
                                            <Save className="h-4 w-4" />
                                            Submit Entries
                                        </button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Net Profit Summary Card */}
                        {netProfitData && (
                            <Card>
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Net Profit Summary</h2>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <p className="text-sm text-blue-600 mb-1">Total Column Value</p>
                                            <p className="text-2xl font-bold text-blue-700">
                                                ₹{netProfitData.totalColumnValue.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <p className="text-sm text-green-600 mb-1">Total Profit</p>
                                            <p className="text-2xl font-bold text-green-700">
                                                ₹{netProfitData.totalProfit.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <p className="text-sm text-purple-600 mb-1">Net Profit</p>
                                            <p className="text-2xl font-bold text-purple-700">
                                                ₹{netProfitData.netProfit.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Weekly Profit Entry Card */}
                        <Card>
                            <CardHeader className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Weekly Profit Entry</h2>
                                <IndianRupee className="h-5 w-5 text-gray-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profit Amount</label>
                                        <input
                                            type="number"
                                            value={profitAmount}
                                            onChange={(e) => setProfitAmount(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter profit amount"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                        <input
                                            type="text"
                                            value={profitDescription}
                                            onChange={(e) => setProfitDescription(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter description"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddProfitEntry}
                                        disabled={!profitAmount}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                                    >
                                        <PlusCircle className="h-4 w-4" />
                                        Add Profit Entry
                                    </button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Weekly Profit Entries List Card */}
                        {weeklyProfitEntries.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <h2 className="text-xl font-semibold">Profit Entries</h2>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {weeklyProfitEntries.map((entry, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold">Total Profit</span>
                                                    <span className="text-green-600 font-bold">
                                                        ${entry.totalProfit.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {entry.entries.map((subEntry, subIndex) => (
                                                        <div key={subIndex} className="text-sm flex justify-between items-center">
                                                            <div>
                                                                <span className="text-gray-600">{subEntry.date}</span>
                                                                {subEntry.description && (
                                                                    <span className="ml-2 text-gray-500">- {subEntry.description}</span>
                                                                )}
                                                            </div>
                                                            <span className="font-medium">${subEntry.amount.toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {entry.notes && (
                                                    <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded">
                                                        {entry.notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ColumnEntry;