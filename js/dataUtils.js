// Data loading and processing utility functions
async function loadData() {
    try {
        const response = await fetch("SpeedFines.csv");
        const text = await response.text();
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows[0];
        const data = rows.slice(1)
            .filter(row => row.length === headers.length) // Filter out any incomplete rows
            .map(row => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header.trim()] = row[i].trim();
                });
                return {
                    ...obj,
                    YEAR: +obj.YEAR,
                    FINES: +obj.FINES,
                    START_DATE: new Date(obj.START_DATE)
                };
            });
        return data;
    } catch (error) {
        console.error("Error loading data:", error);
        throw error;
    }
}

function aggregateMonthlyData(data) {
    // Filter data for 2023-2024
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2024-12-31');
    
    const filteredData = data.filter(d => {
        return d.START_DATE >= startDate && d.START_DATE <= endDate;
    });

    // Group data by month
    const monthlyData = {};
    filteredData.forEach(d => {
        const monthKey = d.START_DATE.toISOString().slice(0, 7); // YYYY-MM format
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += d.FINES;
    });

    // Convert to array and sort by date
    return Object.entries(monthlyData)
        .map(([monthKey, value]) => ({
            date: new Date(monthKey + '-01'), // Convert YYYY-MM to date
            value: value
        }))
        .sort((a, b) => a.date - b.date);
}