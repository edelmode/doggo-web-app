import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Dog, Loader2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

const Dashboard = () => {
    const [weekData, setWeekData] = useState([]);
    const [selectedWeek, setSelectedWeek] = useState(0);
    const [selectedDay, setSelectedDay] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weeks, setWeeks] = useState([]);

    // Color constants for emotions
    const emotionColors = {
        happiness: '#F1D04B',
        relaxed: '#4B5563',
        anger: '#FF4B4B',
        fear: '#000000'
    };

    // Get user_id from localStorage or wherever your app stores it
    const userId = localStorage.getItem('user_id'); // Default to 1 if not found

    useEffect(() => {
        // Fetch weekly summary data
        const fetchWeeklySummary = async () => {
            setLoading(true);
            try {
                // Set correct URL based on deployment environment
                const response = await fetch(`http://localhost:3001/api/dashboard/weekly-summary?user_id=${userId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Response is not JSON. Check API URL and endpoint.');
                }
                
                const result = await response.json();
                
                if (result.status === 'success' && result.weeks) {
                    processWeeklyData(result.weeks);
                } else {
                    setError('Failed to load data: ' + (result.message || 'Unknown error'));
                }
            } catch (err) {
                console.error('Error fetching weekly summary:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklySummary();
    }, [userId]);

    // Process weekly data from API into chart.js format
    const processWeeklyData = (weeksFromApi) => {
        if (!weeksFromApi || weeksFromApi.length === 0) {
            setError('No data available.');
            return;
        }

        const processedWeeks = weeksFromApi.map(week => {
            const dayLabels = week.days.map(day => day.day);
            
            // Create datasets for each emotion
            const datasets = [
                {
                    label: 'Happiness',
                    data: week.days.map(day => day.happiness || 0),
                    backgroundColor: emotionColors.happiness,
                },
                {
                    label: 'Relaxed',
                    data: week.days.map(day => day.relaxed || 0),
                    backgroundColor: emotionColors.relaxed,
                },
                {
                    label: 'Anger',
                    data: week.days.map(day => day.anger || 0),
                    backgroundColor: emotionColors.anger,
                },
                {
                    label: 'Fear',
                    data: week.days.map(day => day.fear || 0),
                    backgroundColor: emotionColors.fear,
                },
            ];

            return {
                week_start: week.week_start,
                label: week.label,
                labels: dayLabels,
                datasets: datasets
            };
        });

        setWeekData(processedWeeks);
        setWeeks(weeksFromApi.map(week => ({
            start: week.week_start,
            label: week.label
        })));

        // Default to the latest week if available
        if (processedWeeks.length > 0) {
            setSelectedWeek(0); 
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false,
                },
                beginAtZero: true,
            },
            y: {
                grid: {
                    display: false,
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    // Calculate top 3 emotions for the selected day
    const getTop3Emotions = (weekIndex, dayIndex) => {
        if (!weekData[weekIndex] || !weekData[weekIndex].datasets) {
            return {
                labels: [],
                datasets: [{ data: [], backgroundColor: [] }]
            };
        }

        const emotions = weekData[weekIndex].datasets.map((dataset) => ({
            label: dataset.label,
            value: dataset.data[dayIndex] || 0,
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

    const pieData = weekData.length > 0 ? getTop3Emotions(selectedWeek, selectedDay) : { labels: [], datasets: [{ data: [], backgroundColor: [] }] };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        elements: {
            arc: {
                borderWidth: 4,
                borderColor: '#ffffff',
                spacing: 10,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    padding: 20,
                    color: '#444',
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
            centerText: {
                display: true,
                text: pieData.labels[0] || '',
            },
        },
    };

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart, args, options) {
            if (options.display && options.text) {
                const { width } = chart;
                const { height } = chart;
                const ctx = chart.ctx;
          
                ctx.restore();
                
                // Set color dynamically based on the emotion
                let color;
                switch (options.text) {
                    case 'Happiness':
                        color = emotionColors.happiness;
                        break;
                    case 'Anger':
                        color = emotionColors.anger;
                        break;
                    case 'Relaxed':
                        color = emotionColors.relaxed;
                        break;
                    case 'Fear':
                        color = emotionColors.fear;
                        break;
                    default:
                        color = '#FFC702';
                        break;
                }
    
                const fontSize = options.fontSize || 30;
                ctx.font = `${fontSize}px Akronim`;

                ctx.fillStyle = color;
                ctx.textBaseline = 'middle';
                
                const text = options.text;
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
          
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }
    };

    ChartJS.register(ArcElement, Tooltip, Legend, centerTextPlugin);
      
    // Prepare data for the line graph (Monthly Emotions)
    const getMonthlyEmotionData = () => {
        if (weekData.length === 0) {
            return {
                labels: [],
                datasets: []
            };
        }

        // Extract all unique emotion labels from all weeks
        const allEmotions = new Set();
        weekData.forEach(week => {
            week.datasets.forEach(dataset => {
                allEmotions.add(dataset.label);
            });
        });

        // Prepare data for each emotion across all weeks
        const datasets = Array.from(allEmotions).map(emotion => {
            const emotionColor = emotionColors[emotion.toLowerCase()] || '#000';
            
            return {
                label: emotion,
                data: weekData.map(week => {
                    const dataset = week.datasets.find(ds => ds.label === emotion);
                    if (dataset) {
                        // Sum up the emotion's values for this week
                        return dataset.data.reduce((sum, value) => sum + value, 0);
                    }
                    return 0;
                }),
                borderColor: emotionColor,
                backgroundColor: `${emotionColor}33`,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            };
        });

        return {
            labels: weekData.map((week, index) => week.label || `Week ${index + 1}`),
            datasets: datasets,
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
                labels: {
                    boxWidth: 12,
                    padding: 15,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#555',
                    font: {
                        weight: '500',
                    },
                },
            },
            y: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#555',
                    font: {
                        weight: '500',
                    },
                },
            },
        },
        elements: {
            line: {
                borderWidth: 3,
            },
            point: {
                radius: 3,
                hoverRadius: 5,
            },
        },
    };

    if (loading) {
        return (
            <div className="w-full p-8 h-screen bg-very-bright-pastel-orange">
                <div className="flex justify-center items-center h-40 mt-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-pastel-orange"></div>
                <p className="ml-3">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-very-bright-pastel-orange p-5">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <p className="text-xl text-red-500 font-medium">Error: {error}</p>
                    <button 
                        className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (weekData.length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-very-bright-pastel-orange p-5">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <Dog className="w-16 h-16 mx-auto text-amber-500" />
                    <p className="text-xl mt-4">No emotion data available.</p>
                    <p className="mt-2 text-gray-600">Start tracking your dog's emotions!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center bg-very-bright-pastel-orange p-5">
            {/* Logo Section */}
            <div className="flex justify-center mt-20">
                <img src="/public/logo.png" alt="Logo" className="w-1/4 h-auto sm:w-1/6 md:w-1/8 lg:w-1/10" />
            </div>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                    <Dog color={emotionColors.happiness} size={20} />
                    <span className="text-sm text-yellow-500">Happiness</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dog color={emotionColors.anger} size={20} />
                    <span className="text-sm text-red-500">Anger</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dog color={emotionColors.relaxed} size={20} />
                    <span className="text-sm text-gray-700">Relaxed</span>
                </div>
                <div className="flex items-center gap-2">
                    <Dog color={emotionColors.fear} size={20} />
                    <span className="text-sm text-black-700">Fear</span>
                </div>
            </div>
    
            {/* Dashboard Content */}
            <div className="flex flex-col md:flex-row w-full gap-7 mt-8">
                {/* Week Dropdown */}
                <div className="bar-container flex-grow max-w-full mx-auto p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-xl font-bold text-center mb-4">Select Week</h2>
                    <select
                        className="block w-full p-2 mb-4 text-center border rounded-md"
                        value={selectedWeek}
                        onChange={(e) => {
                            const weekIndex = parseInt(e.target.value);
                            setSelectedWeek(weekIndex);
                            setSelectedDay(0); // Reset selected day when changing weeks
                        }}
                    >
                        {weekData.map((week, index) => (
                            <option key={week.week_start || index} value={index}>
                                {week.label || `Week ${index + 1}`}
                            </option>
                        ))}
                    </select>
    
                    {/* Bar Graph */}
                    <h2 className="text-2xl font-bold text-center mb-4">Dog Emotion History</h2>
                    <div className="h-96 w-full">
                        <Bar
                            data={weekData[selectedWeek]}
                            options={{
                                ...options,
                                elements: {
                                    bar: {
                                        borderRadius: 5,
                                    },
                                },
                                onClick: (_, elements) => {
                                    if (elements.length > 0) {
                                        const clickedIndex = elements[0].index;
                                        setSelectedDay(clickedIndex);
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
                <div className="w-full max-w-md mx-auto p-4 bg-white shadow-lg rounded-lg">
                    <h2 className="text-2xl font-bold text-center mb-7 mt-7">Top 3 Emotions</h2>
                    <p className="text-center text-sm mb-5">
                        <span className="font-semibold">
                            {weekData[selectedWeek]?.labels[selectedDay] || 'No data'}
                        </span>
                    </p>
                    <div className="h-96 w-full">
                        <Doughnut data={pieData} options={pieOptions} />
                    </div>
                </div>
            </div>
    
            {/* Line Graph */}
            <div className="w-full max-w-4xl mx-auto mt-8 p-4 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Top Emotions Over the Month</h2>
                <div className="h-96 w-full">
                    <Line data={lineData} options={lineOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;