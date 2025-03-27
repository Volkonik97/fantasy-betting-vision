
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
  layout?: "horizontal" | "vertical";
  barSize?: number;
  height?: number | string;
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
  colors = ["#3b82f6", "#ef4444"], 
  showYAxis = true,
  layout = "horizontal",
  barSize = 20,
  height = "100%"
}: BarChartProps) => {
  // Create the config object for customization
  const config = React.useMemo(() => {
    if (Array.isArray(children)) {
      return children.reduce((acc, child, index) => {
        if (React.isValidElement(child) && hasDataKey(child)) {
          acc[child.props.dataKey] = { 
            color: colors[index % colors.length] || "#3b82f6",
            label: child.props.name || child.props.dataKey
          };
        }
        return acc;
      }, {} as Record<string, { color: string, label: string }>);
    } 
    
    if (React.isValidElement(children) && hasDataKey(children)) {
      return { 
        [children.props.dataKey]: { 
          color: colors[0] || "#3b82f6",
          label: children.props.name || children.props.dataKey
        }
      };
    }
    
    return {};
  }, [children, colors]);

  // Add debug logging
  React.useEffect(() => {
    console.log("BarChart data:", data);
    console.log("BarChart config:", config);
    console.log("BarChart layout:", layout);
  }, [data, config, layout]);

  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={data} 
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          barSize={barSize}
          barGap={8}
        >
          {grid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          
          {layout === "horizontal" ? (
            <>
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              {showYAxis && (
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  domain={[0, 100]}
                />
              )}
            </>
          ) : (
            <>
              <XAxis 
                type="number" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
                domain={[0, 100]}
              />
              <YAxis 
                dataKey={xAxisKey} 
                type="category" 
                width={120}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
            </>
          )}
          
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            formatter={(value) => [`${value}%`, '']}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="square"
            iconSize={10}
            wrapperStyle={{ fontSize: 12 }}
          />
          {children}
        </RechartsBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
