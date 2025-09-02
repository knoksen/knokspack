/**
 * Knokspack Analytics & Stats
 * 
 * JavaScript module for rendering analytics charts and handling stats data visualization
 */

(function($) {
    'use strict';

    // Store chart instances for cleanup
    let charts = {};

    // Default chart colors
    const colors = {
        primary: '#007cba',
        secondary: '#00a0d2',
        tertiary: '#46B450',
        quaternary: '#FFB900',
        danger: '#DC3232'
    };

    // Default chart options
    const defaultChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: 'bottom',
            labels: {
                boxWidth: 12
            }
        },
        tooltips: {
            enabled: true,
            mode: 'index',
            intersect: false
        }
    };

    class KnokspackStats {
        constructor() {
            this.initCharts();
            this.setupEventListeners();
            this.refreshData();

            // Auto-refresh every 5 minutes
            setInterval(() => this.refreshData(), 300000);
        }

        initCharts() {
            // Visitors chart
            this.createChart('visitors-chart', {
                type: 'line',
                options: {
                    ...defaultChartOptions,
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM D'
                                }
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

            // Pages chart
            this.createChart('pages-chart', {
                type: 'bar',
                options: {
                    ...defaultChartOptions,
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

            // Demographics chart
            this.createChart('demographics-chart', {
                type: 'doughnut',
                options: {
                    ...defaultChartOptions,
                    cutoutPercentage: 70
                }
            });

            // Devices chart
            this.createChart('devices-chart', {
                type: 'pie',
                options: {
                    ...defaultChartOptions
                }
            });

            // Pageviews chart
            this.createChart('pageviews-chart', {
                type: 'line',
                options: {
                    ...defaultChartOptions,
                    scales: {
                        xAxes: [{
                            type: 'time',
                            time: {
                                unit: 'day'
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });

            // Events chart
            this.createChart('events-chart', {
                type: 'bar',
                options: {
                    ...defaultChartOptions,
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        }

        createChart(canvasId, config) {
            const ctx = document.getElementById(canvasId);
            if (!ctx) return;

            // Destroy existing chart if it exists
            if (charts[canvasId]) {
                charts[canvasId].destroy();
            }

            charts[canvasId] = new Chart(ctx, {
                ...config,
                data: {
                    labels: [],
                    datasets: []
                }
            });
        }

        setupEventListeners() {
            // Period selectors
            $('#visitor-period, #pageview-period, #event-period').on('change', (e) => {
                this.refreshData($(e.target).val());
            });

            // Tab switching
            $('.nav-tab').on('click', (e) => {
                e.preventDefault();
                const target = $(e.target).attr('href').substring(1);
                this.switchTab(target);
            });
        }

        switchTab(target) {
            $('.nav-tab').removeClass('nav-tab-active');
            $(`[href="#${target}"]`).addClass('nav-tab-active');
            $('.tab-pane').removeClass('active');
            $(`#${target}`).addClass('active');

            // Refresh charts in the active tab
            this.refreshData();
        }

        refreshData(period = '7days') {
            this.fetchStats('visitors', period);
            this.fetchStats('page_views', period);
            this.fetchStats('events', period);
            this.fetchStats('devices', period);
            this.fetchPopularPages();
            this.fetchRecentEvents();
        }

        fetchStats(type, period) {
            $.ajax({
                url: knokspackStats.ajaxUrl,
                data: {
                    action: 'knokspack_get_stats',
                    _ajax_nonce: knokspackStats.nonce,
                    type: type,
                    period: period
                },
                success: (response) => {
                    if (response.success) {
                        this.updateCharts(type, response.data);
                    }
                }
            });
        }

        fetchPopularPages() {
            $.ajax({
                url: knokspackStats.ajaxUrl,
                data: {
                    action: 'knokspack_get_popular_pages',
                    _ajax_nonce: knokspackStats.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.updatePopularPages(response.data);
                    }
                }
            });
        }

        fetchRecentEvents() {
            $.ajax({
                url: knokspackStats.ajaxUrl,
                data: {
                    action: 'knokspack_get_recent_events',
                    _ajax_nonce: knokspackStats.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.updateRecentEvents(response.data);
                    }
                }
            });
        }

        updateCharts(type, data) {
            switch (type) {
                case 'visitors':
                    this.updateVisitorsChart(data);
                    this.updateTodayStats(data);
                    break;
                case 'page_views':
                    this.updatePageViewsChart(data);
                    break;
                case 'events':
                    this.updateEventsChart(data);
                    break;
                case 'devices':
                    this.updateDevicesChart(data);
                    break;
            }
        }

        updateVisitorsChart(data) {
            const chart = charts['visitors-chart'];
            if (!chart) return;

            chart.data = {
                labels: data.map(item => item.label),
                datasets: [{
                    label: 'Visitors',
                    data: data.map(item => item.value),
                    borderColor: colors.primary,
                    backgroundColor: 'rgba(0, 124, 186, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            };
            chart.update();
        }

        updatePageViewsChart(data) {
            const chart = charts['pageviews-chart'];
            if (!chart) return;

            chart.data = {
                labels: data.map(item => item.label),
                datasets: [{
                    label: 'Page Views',
                    data: data.map(item => item.value),
                    borderColor: colors.secondary,
                    backgroundColor: 'rgba(0, 160, 210, 0.1)',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            };
            chart.update();
        }

        updateDevicesChart(data) {
            const chart = charts['devices-chart'];
            if (!chart) return;

            chart.data = {
                labels: data.map(item => item.label),
                datasets: [{
                    data: data.map(item => item.value),
                    backgroundColor: [
                        colors.primary,
                        colors.secondary,
                        colors.tertiary
                    ],
                    borderWidth: 0
                }]
            };
            chart.update();
        }

        updateEventsChart(data) {
            const chart = charts['events-chart'];
            if (!chart) return;

            chart.data = {
                labels: data.map(item => item.label),
                datasets: [{
                    label: 'Events',
                    data: data.map(item => item.value),
                    backgroundColor: colors.tertiary,
                    borderWidth: 0
                }]
            };
            chart.update();
        }

        updateTodayStats(data) {
            const todayData = data[data.length - 1];
            if (todayData) {
                $('#today-visitors').text(todayData.value);
                $('#active-now').text(todayData.active || 0);
            }
        }

        updatePopularPages(data) {
            let html = '';
            data.forEach(page => {
                html += `
                    <tr>
                        <td>${page.title}</td>
                        <td>${page.views}</td>
                        <td>${page.avg_time}</td>
                    </tr>
                `;
            });
            $('#popular-pages').html(html);
        }

        updateRecentEvents(data) {
            let html = '';
            data.forEach(event => {
                html += `
                    <tr>
                        <td>${event.name}</td>
                        <td>${event.type}</td>
                        <td>${event.time}</td>
                    </tr>
                `;
            });
            $('#recent-events').html(html);
        }
    }

    // Initialize when document is ready
    $(document).ready(() => {
        new KnokspackStats();
    });

})(jQuery);
