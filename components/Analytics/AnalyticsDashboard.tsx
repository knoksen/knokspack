import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

// Default chart options
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                boxWidth: 12,
                font: {
                    size: 12
                }
            }
        }
    },
    scales: {
        x: {
            type: 'time',
            time: {
                unit: 'day',
                tooltipFormat: 'PPP',
                displayFormats: {
                    day: 'MMM d'
                }
            },
            adapters: {
                date: {
                    locale: enUS
                }
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0
            }
        }
    }
};

// Chart colors
const colors = {
    primary: '#007cba',
    secondary: '#00a0d2',
    tertiary: '#46B450',
    quaternary: '#FFB900',
    danger: '#DC3232'
};

const AnalyticsDashboard = () => {
    const [period, setPeriod] = useState('7days');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        visitors: [],
        pageViews: [],
        devices: [],
        browsers: [],
        topPages: []
    });

    // Load initial data
    useEffect(() => {
        fetchAnalyticsData();
    }, [period]);

    // Fetch data from WordPress backend
    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${knokspackData.ajaxUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    action: 'knokspack_get_stats',
                    _ajax_nonce: knokspackData.nonce,
                    period
                })
            });

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Chart configurations
    const visitorsChart = {
        data: {
            labels: data.visitors.map(d => d.date),
            datasets: [{
                label: 'Unique Visitors',
                data: data.visitors.map(d => d.count),
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}22`,
                fill: true
            }]
        },
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    display: true,
                    text: 'Visitor Trends'
                }
            }
        }
    };

    const pageViewsChart = {
        data: {
            labels: data.pageViews.map(d => d.date),
            datasets: [{
                label: 'Page Views',
                data: data.pageViews.map(d => d.count),
                borderColor: colors.secondary,
                backgroundColor: `${colors.secondary}22`,
                fill: true
            }]
        },
        options: {
            ...defaultOptions,
            plugins: {
                ...defaultOptions.plugins,
                title: {
                    display: true,
                    text: 'Page View Trends'
                }
            }
        }
    };

    const devicesChart = {
        data: {
            labels: data.devices.map(d => d.name),
            datasets: [{
                data: data.devices.map(d => d.count),
                backgroundColor: [colors.primary, colors.secondary, colors.tertiary],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    };

    const browsersChart = {
        data: {
            labels: data.browsers.map(d => d.name),
            datasets: [{
                data: data.browsers.map(d => d.count),
                backgroundColor: [colors.primary, colors.secondary, colors.tertiary, colors.quaternary, colors.danger],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    };

    return (
        <div className="wrap knokspack-analytics">
            <h1>Analytics Dashboard</h1>

            <div className="period-selector">
                <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)}
                >
                    <option value="24hours">Last 24 Hours</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            {loading ? (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                </div>
            ) : (
                <>
                    <div className="stats-overview">
                        <div className="stats-card">
                            <h3>Today's Visitors</h3>
                            <div className="stats-value">
                                {data.today?.visitors || 0}
                            </div>
                        </div>
                        <div className="stats-card">
                            <h3>Today's Page Views</h3>
                            <div className="stats-value">
                                {data.today?.pageViews || 0}
                            </div>
                        </div>
                        <div className="stats-card">
                            <h3>Active Now</h3>
                            <div className="stats-value">
                                {data.activeNow || 0}
                            </div>
                        </div>
                    </div>

                    <div className="chart-grid">
                        <div className="chart-container">
                            <Line {...visitorsChart} />
                        </div>
                        <div className="chart-container">
                            <Line {...pageViewsChart} />
                        </div>
                        <div className="chart-container">
                            <Doughnut {...devicesChart} />
                        </div>
                        <div className="chart-container">
                            <Doughnut {...browsersChart} />
                        </div>
                    </div>

                    <div className="top-pages">
                        <h2>Most Viewed Pages</h2>
                        <table className="wp-list-table widefat fixed striped">
                            <thead>
                                <tr>
                                    <th>Page</th>
                                    <th>Views</th>
                                    <th>Avg. Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topPages.map((page, index) => (
                                    <tr key={index}>
                                        <td>{page.title}</td>
                                        <td>{page.views}</td>
                                        <td>{page.avgTime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsDashboard;
