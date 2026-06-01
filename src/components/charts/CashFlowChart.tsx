import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { CashFlowDay } from '../../types/finance';
import { formatShortCurrency } from '../../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface CashFlowChartProps {
  data: CashFlowDay[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: 'Thu vào',
        data: data.map((d) => d.income / 1_000_000_000),
        backgroundColor: 'rgba(16,185,129,0.65)',
        borderRadius: 5,
        borderSkipped: false as const,
      },
      {
        label: 'Chi ra',
        data: data.map((d) => d.expense / 1_000_000_000),
        backgroundColor: 'rgba(239,68,68,0.55)',
        borderRadius: 5,
        borderSkipped: false as const,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#7e8899',
          font: { family: "'Be Vietnam Pro'" as string, size: 12 as number },
          boxWidth: 10,
          boxHeight: 10,
        },
      },
      tooltip: {
        backgroundColor: '#1e2330',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#e8ecf4',
        bodyColor: '#7e8899',
        padding: 12,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const raw = typeof ctx.raw === 'number' ? ctx.raw : 0;
            return ` ${ctx.dataset.label}: ${formatShortCurrency(raw * 1_000_000_000)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#4a5468', font: { size: 11 as number } },
        grid: { color: 'rgba(255,255,255,0.03)' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: {
          color: '#4a5468',
          font: { size: 11 as number },
          callback: (value: string | number) => `${value}B`,
        },
        grid: { color: 'rgba(255,255,255,0.05)' },
        border: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
