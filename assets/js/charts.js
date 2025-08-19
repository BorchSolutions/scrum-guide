/**
 * SCRUM Guide - Charts and Visualizations
 * Handles burndown charts, velocity trends, and other data visualizations
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready and check if elements exist
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCharts();
            });
        } else {
            this.setupCharts();
        }
    }

    setupCharts() {
        this.setupBurndownChart();
        this.setupVelocityChart();
        this.setupObservers();
    }

    /**
     * Setup burndown chart
     */
    setupBurndownChart() {
        const canvas = document.getElementById('burndownChart');
        if (!canvas) return;

        // Ensure canvas has proper dimensions
        this.resizeCanvas(canvas);

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Sample data for burndown
        const sprintData = {
            totalSP: 42,
            days: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
            ideal: [42, 36, 30, 24, 18, 12, 6, 0],
            actual: [42, 38, 32, 28, 22, 18, 14, 8]
        };

        this.drawBurndownChart(ctx, width, height, sprintData);
        this.charts.burndown = { canvas, ctx, data: sprintData };
    }

    /**
     * Setup velocity chart
     */
    setupVelocityChart() {
        const canvas = document.getElementById('velocityChart');
        if (!canvas) return;

        this.resizeCanvas(canvas);

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Sample velocity data
        const velocityData = {
            sprints: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Sprint 5'],
            values: [38, 42, 45, 39, 44],
            average: 41.6
        };

        this.drawVelocityChart(ctx, width, height, velocityData);
        this.charts.velocity = { canvas, ctx, data: velocityData };
    }

    /**
     * Draw burndown chart
     */
    drawBurndownChart(ctx, width, height, data) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Chart dimensions
        const margin = { top: 40, right: 40, bottom: 60, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Draw axes
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.lineTo(width - margin.right, height - margin.bottom);
        ctx.stroke();

        // Draw grid lines
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 0.5;
        const gridLines = 5;
        for (let i = 1; i <= gridLines; i++) {
            const y = margin.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();
        }

        // Calculate scales
        const xScale = chartWidth / (data.days.length - 1);
        const yScale = chartHeight / data.totalSP;

        // Draw ideal line
        ctx.strokeStyle = '#64748B';
        ctx.setLineDash([8, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.ideal.forEach((value, index) => {
            const x = margin.left + index * xScale;
            const y = height - margin.bottom - value * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw actual line
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.beginPath();
        data.actual.forEach((value, index) => {
            const x = margin.left + index * xScale;
            const y = height - margin.bottom - value * yScale;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#6366F1';
        data.actual.forEach((value, index) => {
            const x = margin.left + index * xScale;
            const y = height - margin.bottom - value * yScale;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';

        // X-axis labels
        data.days.forEach((day, index) => {
            const x = margin.left + index * xScale;
            const y = height - margin.bottom + 20;
            ctx.fillText(day, x, y);
        });

        // Y-axis labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((data.totalSP / 5) * (5 - i));
            const y = margin.top + (chartHeight / 5) * i + 5;
            ctx.fillText(value.toString(), margin.left - 10, y);
        }

        // Chart title
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.fillText('Sprint Burndown', width / 2, 25);

        // Legend
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'left';
        
        // Ideal line legend
        ctx.strokeStyle = '#64748B';
        ctx.setLineDash([8, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width - 150, height - 20);
        ctx.lineTo(width - 120, height - 20);
        ctx.stroke();
        ctx.fillText('Ideal', width - 115, height - 15);
        
        // Actual line legend
        ctx.strokeStyle = '#6366F1';
        ctx.setLineDash([]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width - 150, height - 35);
        ctx.lineTo(width - 120, height - 35);
        ctx.stroke();
        ctx.fillText('Real', width - 115, height - 30);
    }

    /**
     * Draw velocity chart
     */
    drawVelocityChart(ctx, width, height, data) {
        ctx.clearRect(0, 0, width, height);

        const margin = { top: 40, right: 40, bottom: 60, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Draw axes
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.lineTo(width - margin.right, height - margin.bottom);
        ctx.stroke();

        const barWidth = chartWidth / data.values.length * 0.6;
        const barSpacing = chartWidth / data.values.length;
        const maxValue = Math.max(...data.values) * 1.1;
        const yScale = chartHeight / maxValue;

        // Draw bars
        data.values.forEach((value, index) => {
            const barHeight = value * yScale;
            const x = margin.left + index * barSpacing + (barSpacing - barWidth) / 2;
            const y = height - margin.bottom - barHeight;

            // Create gradient
            const gradient = ctx.createLinearGradient(0, y, 0, height - margin.bottom);
            gradient.addColorStop(0, '#6366F1');
            gradient.addColorStop(1, '#764ba2');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Value label on top of bar
            ctx.fillStyle = '#E2E8F0';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
            ctx.textAlign = 'center';
            ctx.fillText(value.toString(), x + barWidth / 2, y - 8);

            // Sprint label below bar
            ctx.fillText(data.sprints[index], x + barWidth / 2, height - margin.bottom + 20);
        });

        // Draw average line
        const avgY = height - margin.bottom - data.average * yScale;
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.beginPath();
        ctx.moveTo(margin.left, avgY);
        ctx.lineTo(width - margin.right, avgY);
        ctx.stroke();

        // Average label
        ctx.fillStyle = '#10B981';
        ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'left';
        ctx.fillText(`Promedio: ${data.average.toFixed(1)}`, width - 120, avgY - 8);

        // Chart title
        ctx.fillStyle = '#E2E8F0';
        ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'center';
        ctx.fillText('Velocity por Sprint', width / 2, 25);

        // Y-axis labels
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = Math.round((maxValue / 5) * (5 - i));
            const y = margin.top + (chartHeight / 5) * i + 5;
            ctx.fillText(value.toString(), margin.left - 10, y);
        }
    }

    /**
     * Resize canvas to match container
     */
    resizeCanvas(canvas) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set actual size in memory (scaled for high DPI)
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = (rect.height - 100) * dpr; // Subtract for title space
        
        // Scale the drawing context to match device pixel ratio
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // Set the size in CSS pixels
        canvas.style.width = rect.width + 'px';
        canvas.style.height = (rect.height - 100) + 'px';
    }

    /**
     * Setup observers for chart animations
     */
    setupObservers() {
        const chartObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chartId = entry.target.id;
                    this.animateChart(chartId);
                }
            });
        }, { threshold: 0.3 });

        // Observe chart containers
        document.querySelectorAll('.chart-container').forEach(container => {
            chartObserver.observe(container);
        });
    }

    /**
     * Animate chart appearance
     */
    animateChart(chartId) {
        const canvas = document.getElementById(chartId);
        if (!canvas || canvas.classList.contains('animated')) return;

        canvas.classList.add('animated');
        canvas.style.opacity = '0';
        canvas.style.transform = 'translateY(30px)';
        canvas.style.transition = 'all 0.8s ease';

        // Trigger animation
        setTimeout(() => {
            canvas.style.opacity = '1';
            canvas.style.transform = 'translateY(0)';
        }, 100);
    }

    /**
     * Update chart data and redraw
     */
    updateChart(chartType, newData) {
        const chart = this.charts[chartType];
        if (!chart) return;

        chart.data = { ...chart.data, ...newData };
        
        if (chartType === 'burndown') {
            this.drawBurndownChart(chart.ctx, chart.canvas.width, chart.canvas.height, chart.data);
        } else if (chartType === 'velocity') {
            this.drawVelocityChart(chart.ctx, chart.canvas.width, chart.canvas.height, chart.data);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        Object.entries(this.charts).forEach(([type, chart]) => {
            this.resizeCanvas(chart.canvas);
            
            if (type === 'burndown') {
                this.drawBurndownChart(chart.ctx, chart.canvas.width, chart.canvas.height, chart.data);
            } else if (type === 'velocity') {
                this.drawVelocityChart(chart.ctx, chart.canvas.width, chart.canvas.height, chart.data);
            }
        });
    }

    /**
     * Export chart as image
     */
    exportChart(chartType, format = 'png') {
        const chart = this.charts[chartType];
        if (!chart) return null;

        return chart.canvas.toDataURL(`image/${format}`);
    }
}

// Initialize charts and handle window resize
document.addEventListener('DOMContentLoaded', () => {
    const chartManager = new ChartManager();
    
    window.addEventListener('resize', () => {
        clearTimeout(window.chartResizeTimeout);
        window.chartResizeTimeout = setTimeout(() => {
            chartManager.handleResize();
        }, 250);
    });
    
    // Make chartManager globally available for debugging
    window.chartManager = chartManager;
});