import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { readExcelFile, exportToExcel, Patient } from '@/lib/excel-utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell }
    from 'recharts';
import { Upload, FileSpreadsheet, Users, Activity, AlertCircle } from 'lucide-react';
import AddPatientForm from './AddPatientForm';
import PatientList from './PatientList';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const API_URL = "https://script.google.com/macros/s/AKfycbw6RixyCNFAJGCDChVJA0KU_iaqy3jNYVibpBWVemwi25fIOv_Wr6mM1rkFJdLyEoteeg/exec";

export default function Dashboard() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        hba1cControlled: 0,
        bmiNormal: 0,
        active: 0
    });
    const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'add'>('overview');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Handle error from API object if it returns one
            if (data.error) {
                console.error("API Error:", data.error);
                setError("API Error: " + data.error);
                return;
            }

            // Validate data is an array
            if (!Array.isArray(data)) {
                console.error("API returned non-array:", data);
                setError("Received invalid data format from server (expected array).");
                return;
            }

            setPatients(data);
            calculateStats(data);
        } catch (error: any) {
            console.error("Failed to fetch data", error);
            setError("Failed to connect to backend: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const data = await readExcelFile(e.target.files[0]);
                setPatients(data);
                calculateStats(data);
            } catch (error) {
                console.error("Failed to read file", error);
                alert("Failed to read Excel file. Please ensure it's the correct format.");
            }
        }
    };

    const handleExport = () => {
        if (patients.length === 0) {
            alert("No data to export.");
            return;
        }
        exportToExcel(patients, "MOGC_Data_Export.xlsx");
    };

    const calculateStats = (data: Patient[]) => {
        const total = data.length;
        // Assuming 'Done' or specific values indicate control. 
        // This is a placeholder logic based on available parsed data.
        const hba1cControlled = data.filter(p => p.hba1c && parseFloat(p.hba1c) < 6.5).length;
        const bmiNormal = data.filter(p => p.bmi && parseFloat(p.bmi.toString()) < 25).length;
        const active = data.filter(p => p.status === 'AKTIF').length;

        setStats({ total, hba1cControlled, bmiNormal, active });
    };

    const diabetesTypeData = [
        { name: 'Type 1', value: patients.filter(p => p.diabetesType === 'Type 1').length },
        { name: 'Type 2', value: patients.filter(p => p.diabetesType === 'Type 2').length },
    ];

    return (
        <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">MOGC Dashboard</h1>
                    <p className="text-slate-500">Overview of Diabetes Control Performance</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="gap-2" onClick={fetchData} disabled={loading}>
                        <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                    <div className="hidden relative"> {/* Hide Import for now as we use Sheets */}
                        <input
                            type="file"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept=".xlsx, .xls"
                            aria-label="Import Excel File"
                        />
                        <Button className="gap-2">
                            <Upload className="w-4 h-4" /> Import Excel
                        </Button>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <FileSpreadsheet className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            {patients.length === 0 && !error ? (
                <Card className="border-dashed border-2 py-12 flex flex-col items-center justify-center text-slate-400">
                    <Upload className="w-12 h-12 mb-4" />
                    <p className="text-lg">Upload your MOGC Excel file to get started</p>
                </Card>
            ) : null}

            {error && (
                <Card className="border-red-200 bg-red-50 py-12 flex flex-col items-center justify-center text-red-600">
                    <AlertCircle className="w-12 h-12 mb-4" />
                    <p className="text-lg font-bold">Error loading data</p>
                    <p className="text-sm">{error}</p>
                    <Button variant="outline" className="mt-4 border-red-200 hover:bg-red-100" onClick={fetchData}>
                        Retry
                    </Button>
                </Card>
            )}

            {patients.length > 0 && (
                <>
                    <div className="flex space-x-2 border-b">
                        <button
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'patients' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('patients')}
                        >
                            Patients List
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'add' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setActiveTab('add')}
                        >
                            Add Patient
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {/* Stats Cards */}
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.total}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.active}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">HbA1c &lt; 6.5%</CardTitle>
                                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.hba1cControlled}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {((stats.hba1cControlled / stats.total) * 100).toFixed(1)}% of total
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Normal BMI</CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{stats.bmiNormal}</div>
                                        <p className="text-xs text-muted-foreground">
                                            {((stats.bmiNormal / stats.total) * 100).toFixed(1)}% of total
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                                <Card className="col-span-4">
                                    <CardHeader>
                                        <CardTitle>Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pl-2">
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { name: 'BMI < 25', total: stats.bmiNormal },
                                                    { name: 'HbA1c < 6.5', total: stats.hba1cControlled },
                                                ]}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Bar dataKey="total" fill="#8884d8" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="col-span-3">
                                    <CardHeader>
                                        <CardTitle>Diabetes Type</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={diabetesTypeData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {diabetesTypeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === 'patients' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <PatientList patients={patients} />
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <AddPatientForm apiUrl={API_URL} onSuccess={fetchData} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
