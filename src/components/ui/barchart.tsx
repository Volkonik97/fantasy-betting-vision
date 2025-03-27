
import React from "react";
import { BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from "recharts";
import { ChartContainer } from "./chart";

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  children: React.ReactNode;
  grid?: boolean;
  colors?: string[];
  showYAxis?: boolean;
}

// Type guard function to check if a React element has dataKey prop
const hasDataKey = (element: React.ReactElement): element is React.ReactElement & { props: { dataKey: string, name?: string } } => {
  return element.props && typeof element.props.dataKey === 'string';
};

export const BarChart = ({ 
  data, 
  xAxisKey, 
  children, 
  grid = true, 
  colors = ["#2563eb", "#f43f5e"], 
  showYAxis = false 
}: BarChartProps) => {
  // Create the config object for customization
  const config = Array.isArray(children) 
    ? children.reduce((acc, child, index) => {
        if (React.isValidElement(child) && hasDataKey(child)) {
          acc[child.props.dataKey] = { 
            color: colors[index % colors.length] || "#2563eb",
            label: child.props.name || child.props.dataKey
          };
        }
        return acc;
      }, {} as Record<string, { color: string, label: string }>)
    : React.isValidElement(children) && hasDataKey(children)
      ? { [children.props.dataKey]: { 
          color: colors[0] || "#2563eb",
          label: children.props.name || children.props.dataKey
        }}
      : {};

  return (
    <ChartContainer config={config}>
      <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {grid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} />
        {showYAxis && <YAxis />}
        <Tooltip />
        <Legend />
        {children}
      </RechartsBarChart>
    </ChartContainer>
  );
};
