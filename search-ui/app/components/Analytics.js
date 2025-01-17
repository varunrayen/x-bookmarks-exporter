'use client';

import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Analytics() {
  // Dummy data for analytics
  const analyticsData = {
    totalBookmarks: 256,
    bookmarksThisWeek: 23,
    topDomains: [
      { name: 'github.com', count: 45 },
      { name: 'medium.com', count: 32 },
      { name: 'dev.to', count: 28 },
      { name: 'stackoverflow.com', count: 25 },
      { name: 'youtube.com', count: 22 },
    ],
    bookmarksByMonth: [
      { month: 'Aug', count: 45 },
      { month: 'Sep', count: 52 },
      { month: 'Oct', count: 38 },
      { month: 'Nov', count: 41 },
      { month: 'Dec', count: 35 },
      { month: 'Jan', count: 45 },
    ],
    categories: [
      { name: 'Technology', count: 120 },
      { name: 'Development', count: 85 },
      { name: 'Design', count: 45 },
      { name: 'Business', count: 35 },
      { name: 'Other', count: 15 },
    ],
  };

  const monthlyChartData = {
    labels: analyticsData.bookmarksByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Bookmarks',
        data: analyticsData.bookmarksByMonth.map(item => item.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Monthly Bookmarks Trend',
        color: '#374151',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const domainsChartData = {
    labels: analyticsData.topDomains.map(domain => domain.name),
    datasets: [
      {
        data: analyticsData.topDomains.map(domain => domain.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const categoriesChartData = {
    labels: analyticsData.categories.map(cat => cat.name),
    datasets: [
      {
        data: analyticsData.categories.map(cat => cat.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Bookmarks Analytics</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Bookmarks</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{analyticsData.totalBookmarks}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">New This Week</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{analyticsData.bookmarksThisWeek}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <Line data={monthlyChartData} options={monthlyChartOptions} />
        </div>

        {/* Top Domains */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Domains</h3>
          <Bar
            data={domainsChartData}
            options={{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                },
                y: {
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>

        {/* Categories Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-full">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Categories Distribution</h3>
          <div className="h-[300px] flex justify-center">
            <Doughnut data={categoriesChartData} options={pieChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
