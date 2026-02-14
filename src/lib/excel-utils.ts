import * as XLSX from 'xlsx';

export interface Patient {
    id: number;
    district: string;
    clinic: string;
    name: string;
    ic: string;
    age: number;
    gender: string;
    race: string;
    diagnosisDate: string; // Excel serial date or string
    diabetesType: string;
    mogcRegDate: string;
    status: string;
    height: number;
    weight: number;
    bmi: number;
    bmiStatus: string;
    waist: number;
    waistStatus: string;
    bp: string;
    bpStatus: string;
    va: string;
    vaStatus: string;
    fundus: string;
    fundusStatus: string;
    foot: string;
    footStatus: string;
    rbs: string;
    rbsStatus: string;
    hba1c: string;
    hba1cStatus: string;
    labs: string; // FSL/LFT/RP
    labsStatus: string;
    urineProtein: string;
    urineProteinStatus: string;
    microalbumin: string;
    microalbuminStatus: string;
    education: string;
    educationStatus: string;
    counseling: string;
    counselingStatus: string;
}

export const readExcelFile = (file: File): Promise<Patient[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                // Assume data is in the sheet named "Table-PENGISIAN DATA PESAKIT" or the 3rd sheet
                const sheetName = workbook.SheetNames.find(name => name.includes("PENGISIAN DATA")) || workbook.SheetNames[2];
                const sheet = workbook.Sheets[sheetName];

                // Convert to JSON, starting from row 4 (index 3) where headers likely are, or adjust based on analysis
                // Based on analysis: Headers are at row 4 (index 3). Data starts at row 5.
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 3 });

                const patients: Patient[] = jsonData.slice(2).map((row: any) => {
                    // Helper for Excel dates
                    const parseDate = (val: any) => {
                        if (!val) return null;
                        if (typeof val === 'number') {
                            // Excel serial date to JS Date
                            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                            return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
                        }
                        return val;
                    };

                    return {
                        id: row[0],
                        district: row[1],
                        clinic: row[2],
                        name: row[3],
                        ic: row[4],
                        age: row[5],
                        gender: row[6],
                        race: row[7],
                        diagnosisDate: parseDate(row[8]),
                        diabetesType: row[9],
                        mogcRegDate: parseDate(row[10]),
                        status: row[11],

                        height: row[13],
                        weight: row[14],

                        bmiStatus: row[15],
                        bmiDate: parseDate(row[16]),
                        bmi: row[17],

                        waistStatus: row[18],
                        waistDate: parseDate(row[19]),
                        waist: row[20],

                        bpStatus: row[21],
                        bpDate: parseDate(row[22]),
                        bp: row[23],

                        vaStatus: row[24],
                        vaDate: parseDate(row[25]),
                        va: row[26],

                        fundusStatus: row[27],
                        fundusDate: parseDate(row[28]),
                        fundus: row[29],

                        footStatus: row[30],
                        footDate: parseDate(row[31]),
                        foot: row[32],

                        rbsStatus: row[33],
                        rbsDate: parseDate(row[34]),
                        rbs: row[35],

                        hba1cStatus: row[36],
                        hba1cDate: parseDate(row[37]),
                        hba1c: row[38],

                        labsStatus: row[39],
                        labsDate: parseDate(row[40]),
                        labs: row[41],

                        urineProteinStatus: row[42],
                        urineProteinDate: parseDate(row[43]),
                        urineProtein: row[44],

                        microalbuminStatus: row[45],
                        microalbuminDate: parseDate(row[46]),
                        microalbumin: row[47],

                        educationStatus: row[48],
                        educationDate: parseDate(row[49]),

                        counselingStatus: row[50], // Check index
                    } as any; // Type assertion for now to bypass strict checks during prototyping
                }).filter((p: any) => p.name);

                resolve(patients);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsBinaryString(file);
    });
};

export const exportToExcel = (patients: Patient[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(patients);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, fileName);
};
