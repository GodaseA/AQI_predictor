import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const AQITrendChart = ({ data }) => {
  if (!data || !data.labels) {
    return <div className="chart-placeholder">No data available</div>
  }

  const chartData = data.labels.map((label, index) => ({
    time: label,
    aqi: data.datasets[0].data[index]
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis domain={[0, 500]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="aqi"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default AQITrendChart