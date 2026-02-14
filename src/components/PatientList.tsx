import React, { useState } from 'react';
import { Patient } from '@/lib/excel-utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientListProps {
    patients: Patient[];
}

export default function PatientList({ patients }: PatientListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.ic.includes(searchTerm)
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patient Registry</CardTitle>
                <div className="relative max-w-sm mt-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by Name or IC..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IC</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Age</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Gender</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Diabetes Type</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">HbA1c</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">BMI</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient, index) => (
                                    <tr key={index} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle font-medium">{patient.name}</td>
                                        <td className="p-4 align-middle">{patient.ic}</td>
                                        <td className="p-4 align-middle">{patient.age}</td>
                                        <td className="p-4 align-middle">{patient.gender}</td>
                                        <td className="p-4 align-middle">{patient.diabetesType}</td>
                                        <td className="p-4 align-middle">{patient.hba1c} <span className="text-xs text-slate-400">({patient.hba1cDate})</span></td>
                                        <td className="p-4 align-middle">{patient.bmi}</td>
                                        <td className="p-4 align-middle">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${patient.status === 'AKTIF' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-4 text-center text-muted-foreground">No patients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    Showing {filteredPatients.length} of {patients.length} patients
                </p>
            </CardContent>
        </Card>
    );
}
