import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Loader2 } from 'lucide-react';

interface AddPatientFormProps {
    onSuccess: () => void;
    apiUrl: string;
}

export default function AddPatientForm({ onSuccess, apiUrl }: AddPatientFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        ic: '',
        height: '',
        weight: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateAutoFields = () => {
        let age = '';
        let gender = '';
        let bmi = '';

        // Age & Gender from IC
        if (formData.ic.length >= 12) {
            const yearHeader = parseInt(formData.ic.substring(0, 2));
            const currentYear = new Date().getFullYear();
            // Simple logic: if > 25, assume 19xx, else 20xx
            const fullYear = yearHeader > 25 ? 1900 + yearHeader : 2000 + yearHeader;
            age = (currentYear - fullYear).toString();

            const lastDigit = parseInt(formData.ic.slice(-1));
            gender = lastDigit % 2 === 0 ? 'Female' : 'Male';
        }

        // BMI
        if (formData.height && formData.weight) {
            const h = parseFloat(formData.height); // assuming meters
            const w = parseFloat(formData.weight);
            if (h > 0) {
                bmi = (w / (h * h)).toFixed(1);
            }
        }

        return { age, gender, bmi };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { age, gender, bmi } = calculateAutoFields();

        // Construct payload matching the Apps Script expectation
        const payload = {
            name: formData.name,
            ic: formData.ic,
            age: age,
            gender: gender,
            height: formData.height,
            weight: formData.weight,
            bmi: bmi,
            // Add defaults
            diabetesType: 'Type 2', // Default
            race: 'Malay' // Default or add select
        };

        try {
            await fetch(apiUrl, {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            alert("Patient added successfully!");
            setFormData({ name: '', ic: '', height: '', weight: '' });
            onSuccess(); // Refresh list
        } catch (error) {
            console.error("Error adding patient", error);
            alert("Failed to add patient.");
        } finally {
            setLoading(false);
        }
    };

    const { age, gender, bmi } = calculateAutoFields();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" /> Add New Patient
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input required name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">IC Number</label>
                            <Input required name="ic" value={formData.ic} onChange={handleChange} placeholder="e.g. 800101011234" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Height (Meters)</label>
                            <Input required name="height" type="number" step="0.01" value={formData.height} onChange={handleChange} placeholder="e.g. 1.75" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Weight (KG)</label>
                            <Input required name="weight" type="number" step="0.1" value={formData.weight} onChange={handleChange} placeholder="e.g. 70.5" />
                        </div>
                    </div>

                    {/* Preview Auto-Calculated Fields */}
                    <div className="p-4 bg-slate-100 rounded-md text-sm grid grid-cols-3 gap-4">
                        <div>
                            <span className="text-slate-500 block">Calculated Age</span>
                            <span className="font-semibold">{age || '-'}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Gender</span>
                            <span className="font-semibold">{gender || '-'}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">BMI</span>
                            <span className="font-semibold">{bmi || '-'}</span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Save Patient'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
