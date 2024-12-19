import React, { useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2'; // Import Doughnut
import 'chart.js/auto';

const Dashboard = () => {
    // Dummy data for 4 weeks (1 month)
    const weekData = [
        {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [10, 15, 12, 18, 16, 20, 14],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [5, 3, 8, 2, 4, 3, 5],
                    backgroundColor: '#808080',
                },
                {
                    label: 'Anger',
                    data: [2, 10, 2, 5, 2, 15, 4],
                    backgroundColor: '#85522D',
                },
                {
                    label: 'Anxious',
                    data: [1, 8, 2, 6, 3, 4, 3],
                    backgroundColor: '#C62E2E',
                },
                {
                    label: 'Fear',
                    data: [1, 12, 18, 4, 3, 2, 6],
                    backgroundColor: '#000000',
                },
            ],
        },
        {
            labels: ['Day 8', 'Day 9', 'Day 10', 'Day 11', 'Day 12', 'Day 13', 'Day 14'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [8, 10, 7, 14, 11, 16, 12],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [4, 2, 6, 1, 3, 2, 4],
                    backgroundColor: '#808080',
                },
                {
                    label: 'Anger',
                    data: [3, 9, 4, 6, 2, 12, 5],
                    backgroundColor: '#85522D',
                },
                {
                    label: 'Anxious',
                    data: [1, 6, 3, 7, 2, 5, 4],
                    backgroundColor: '#C62E2E',
                },
                {
                    label: 'Fear',
                    data: [2, 10, 16, 5, 3, 1, 7],
                    backgroundColor: '#000000',
                },
            ],
        },
        {
            labels: ['Day 15', 'Day 16', 'Day 17', 'Day 18', 'Day 19', 'Day 20', 'Day 21'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [13, 11, 9, 10, 15, 18, 14],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [3, 4, 5, 2, 6, 1, 4],
                    backgroundColor: '#808080',
                },
                {
                    label: 'Anger',
                    data: [4, 7, 5, 6, 9, 8, 3],
                    backgroundColor: '#85522D',
                },
                {
                    label: 'Anxious',
                    data: [5, 8, 6, 7, 3, 4, 6],
                    backgroundColor: '#C62E2E',
                },
                {
                    label: 'Fear',
                    data: [6, 10, 8, 9, 7, 6, 5],
                    backgroundColor: '#000000',
                },
            ],
        },
        {
            labels: ['Day 22', 'Day 23', 'Day 24', 'Day 25', 'Day 26', 'Day 27', 'Day 28'],
            datasets: [
                {
                    label: 'Happiness',
                    data: [9, 13, 15, 12, 17, 14, 10],
                    backgroundColor: '#F1D04B',
                },
                {
                    label: 'Relaxed',
                    data: [2, 4, 3, 5, 3, 4, 2],
                    backgroundColor: '#808080',
                },
                {
                    label: 'Anger',
                    data: [6, 8, 7, 5, 6, 9, 4],
                    backgroundColor: '#85522D',
                },
                {
                    label: 'Anxious',
                    data: [3, 5, 7, 6, 5, 8, 2],
                    backgroundColor: '#C62E2E',
                },
                {
                    label: 'Fear',
                    data: [7, 9, 8, 6, 4, 5, 3],
                    backgroundColor: '#000000',
                },
            ],
        },

    {
        labels: ['Day 29', 'Day 30', 'Day 31'],
        datasets: [
            {
                label: 'Happiness',
                data: [9, 13, 15, 12, 17, 14, 10],
                backgroundColor: '#F1D04B',
            },
            {
                label: 'Relaxed',
                data: [2, 4, 3, 5, 3, 4, 2],
                backgroundColor: '#808080',
            },
            {
                label: 'Anger',
                data: [6, 8, 7, 5, 6, 9, 4],
                backgroundColor: '#85522D',
            },
            {
                label: 'Anxious',
                data: [3, 5, 7, 6, 5, 8, 2],
                backgroundColor: '#C62E2E',
            },
            {
                label: 'Fear',
                data: [7, 9, 8, 6, 4, 5, 3],
                backgroundColor: '#000000',
            },
        ],
    },
];


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
                max: 24, // Set the maximum value of y-axis to 24
                ticks: {
                    stepSize: 1, // Step interval between ticks
                    callback: (value) => `${value} hr`, // Append "hr" to tick values
                },
                
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    const [selectedWeek, setSelectedWeek] = useState(0); // Track the selected week (index)
    const [selectedDay, setSelectedDay] = useState(0); // Track the selected day (index)

    // Calculate top 3 emotions for the selected day
    const getTop3Emotions = (weekIndex, dayIndex) => {
        const emotions = weekData[weekIndex].datasets.map((dataset) => ({
            label: dataset.label,
            value: dataset.data[dayIndex],
        }));

        // Sort by value and take the top 3
        const top3 = emotions.sort((a, b) => b.value - a.value).slice(0, 3);

        return {
            labels: top3.map((emotion) => emotion.label),
            datasets: [
                {
                    data: top3.map((emotion) => emotion.value),
                    backgroundColor: top3.map((emotion) =>
                        weekData[weekIndex].datasets.find((dataset) => dataset.label === emotion.label).backgroundColor
                    ),
                },
            ],
        };
    };

    const pieData = getTop3Emotions(selectedWeek, selectedDay);

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true, // Show the legend
                position: 'bottom', // Position the legend at the bottom
                maxWidth: 200, // Set the maximum width of the legend
                labels: {
                    padding: 20, // Adds padding around the legend items 
                },
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const emotion = tooltipItem.raw;
                        const label = pieData.labels[tooltipItem.dataIndex];
                        return `${label}: ${emotion}`;
                    },
                },
            },
        },
    };

    // Prepare data for the line graph (Monthly Emotions)
    const getMonthlyEmotionData = () => {
        const monthlySums = {};

        weekData.forEach((week) => {
            week.datasets.forEach((dataset) => {
                if (!monthlySums[dataset.label]) {
                    monthlySums[dataset.label] = Array(week.labels.length).fill(0);
                }
                dataset.data.forEach((value, index) => {
                    monthlySums[dataset.label][index] = (monthlySums[dataset.label][index] || 0) + value;
                });
            });
        });

        return {
            labels: Array.from({ length: 5 }, (_, i) => `Week ${i + 1}`), // Days of the month
            datasets: Object.entries(monthlySums).map(([emotion, values], index) => ({
                label: emotion,
                data: values,
                borderColor: weekData[0].datasets[index]?.backgroundColor || '#000',
                fill: false,
                tension: 0.2,
            })),
        };
    };

    const lineData = getMonthlyEmotionData();

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                padding: 20,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="h-100% flex flex-col items-center justify-center bg-gray-100 p-5 ">
             {/* Logo Section */}
             <div className="flex justify-center mt-20">
                <img src="/public/dash_title.png" alt="Logo" className="w-200 h-auto" />
            </div>
            {/* Dashboard Content */}
                <div className="justify inline-flex width-80%">
                {/* Week Dropdown */}
                <div className="bar-container flex-grow w-3/5 max-w-[65%] mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-1xl font-bold text-center mb-4">Select Week</h2>
                    <select
                        className="block w-full p-2 mb-4 text-center border rounded-md"
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    >
                        <option value={0}>Week 1 (Day 1 to Day 7)</option>
                        <option value={1}>Week 2 (Day 8 to Day 14)</option>
                        <option value={2}>Week 3 (Day 15 to Day 21)</option>
                        <option value={3}>Week 4 (Day 22 to Day 28)</option>
                        <option value={4}>Week 5 (Day 29 to Day 31)</option>
                    </select>

                    {/* Bar Graph */}

                    <h2 className="text-2xl font-bold text-center mb-4">Dog Emotion History</h2>
                    <div style={{ height: '400px', width: '101%' }}>
                        <Bar
                            data={weekData[selectedWeek]}
                            options={{
                                ...options,
                                onClick: (_, elements) => {
                                    if (elements.length > 0) {
                                        const clickedIndex = elements[0].index;
                                        setSelectedDay(clickedIndex); // Update the selected day
                                    }
                                },
                            }}
                        />
                    </div>
                    
                    <p className="text-center text-gray-500 mt-2">
                        Click a bar to view the top 3 emotions for that day.
                    </p>
                </div>
                
                {/* Pie Chart */}
                <div className="w-full max-w-md mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold text-center mb-7 mt-7">Top 3 Emotions</h2>
                    <div style={{ height: '400px', width: '100%' }}>
                        <Doughnut data={pieData} options={pieOptions} />
                    </div>
                </div>
            </div>

             {/* Line Graph */}
             <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Top Emotions Over the Month</h2>
                <div style={{ height: '400px', width: '100%' }}>
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>
        </div>

    );
};

export default Dashboard;
