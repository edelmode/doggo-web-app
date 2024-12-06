import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2'; // Import Doughnut
import 'chart.js/auto';

const Dashboard = () => {
    const data = {
        labels: [
            'Day 1',
            'Day 2',
            'Day 3',
            'Day 4',
            'Day 5',
            'Day 6',
            'Day 7',
        ],
        datasets: [
            {
                label: 'Happiness',
                data: [5, 7, 6, 9, 8, 10, 7],
                backgroundColor: '#F1D04B',
            },
            {
                label: 'Sadness',
                data: [3, 2, 4, 1, 2, 1, 3],
                backgroundColor: '#808080',
            },
            {
                label: 'Anger',
                data: [1, 5, 1, 2, 1, 10, 2],
                backgroundColor: '#85522D',
            },
            {
                label: 'Anxious',
                data: [1, 5, 1, 2, 1, 1, 2],
                backgroundColor: '#C62E2E',
            },
            {
                label: 'Fear',
                data: [1, 5, 10, 2, 1, 1, 2],
                backgroundColor: '#000000', // Corrected color
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className='h-screen flex flex-col items-center justify-center bg-gray-100 p-5'>
            <div className='justify inline-flex width-80%'>
                <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold text-center mb-4">Emotion History</h2>
                    <div style={{ height: '400px', width: '100%' }}>
                        <Bar data={data} options={options} />
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold text-center mb-4">Emotion Distribution</h2>
                    <div style={{ height: '300px', width: '100%' }}>
                        <Doughnut data={data} options={options} />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
