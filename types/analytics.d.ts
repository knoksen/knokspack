declare global {
    interface Window {
        knokspackData: {
            ajaxUrl: string;
            nonce: string;
            pluginUrl: string;
            version: string;
        }
    }
}

export interface AnalyticsData {
    today: {
        visitors: number;
        pageViews: number;
    };
    activeNow: number;
    visitors: Array<{
        date: string;
        count: number;
    }>;
    pageViews: Array<{
        date: string;
        count: number;
    }>;
    devices: Array<{
        name: string;
        count: number;
    }>;
    browsers: Array<{
        name: string;
        count: number;
    }>;
    topPages: Array<{
        title: string;
        views: number;
        avgTime: string;
    }>;
}

export interface ChartOptions {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins: {
        legend: {
            position: 'top' | 'bottom' | 'left' | 'right';
            labels: {
                boxWidth: number;
                font?: {
                    size: number;
                };
            };
        };
        title?: {
            display: boolean;
            text: string;
        };
    };
    scales?: {
        x?: {
            type: string;
            time?: {
                unit: string;
                tooltipFormat: string;
                displayFormats: {
                    [key: string]: string;
                };
            };
            adapters?: {
                date: {
                    locale: any;
                };
            };
        };
        y?: {
            beginAtZero: boolean;
            ticks?: {
                precision: number;
            };
        };
    };
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label?: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string | string[];
        fill?: boolean;
        borderWidth?: number;
    }>;
}

export interface ChartProps {
    data: ChartData;
    options: ChartOptions;
}

// Access the global object
const knokspackData = (window as any).knokspackData;
