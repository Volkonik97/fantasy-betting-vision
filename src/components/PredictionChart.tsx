
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PredictionChartProps {
  blueWinRate: number;
  redWinRate: number;
  teamBlueName: string;
  teamRedName: string;
}

const PredictionChart = ({
  blueWinRate,
  redWinRate,
  teamBlueName,
  teamRedName,
}: PredictionChartProps) => {
  const data = [
    { name: teamBlueName, value: blueWinRate },
    { name: teamRedName, value: redWinRate },
  ];

  const COLORS = ["#0AC8B9", "#E84057"];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium">{`${payload[0].name}: ${payload[0].value.toFixed(0)}%`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-4 h-full">
      <h3 className="text-lg font-medium mb-4">Win Prediction</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              animationDuration={800}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-lol-blue" />
          <span className="text-sm">{teamBlueName} - {blueWinRate.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-lol-red" />
          <span className="text-sm">{teamRedName} - {redWinRate.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
