
import { useMood } from "@/contexts/MoodContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const MoodChart = () => {
  const { getUserTrend } = useMood();
  const trend = getUserTrend();
  
  if (!trend.chart || trend.chart.data.length === 0) {
    return (
      <Card className="w-full shadow-md bg-white">
        <CardHeader>
          <CardTitle className="text-xl text-slate-text">Mood Trends</CardTitle>
          <CardDescription>
            {trend.notes}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // Format data for recharts
  const data = trend.chart.labels.map((label, index) => ({
    date: label,
    score: trend.chart!.data[index]
  }));
  
  // Get trend color
  const getTrendColor = () => {
    switch (trend.trend) {
      case 'upward': return '#37D69C'; // leaf-green
      case 'downward': return '#F2D5B3'; // peach-glow
      default: return '#8FD5F8'; // sky-blue
    }
  };

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-text">Mood Trends</CardTitle>
        <CardDescription>
          {trend.notes}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 5,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip 
                formatter={(value) => [`Mood score: ${Number(value).toFixed(2)}`, 'Score']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  color: 'hsl(var(--popover-foreground))',
                  fontSize: '14px',
                  padding: '8px 12px'
                }}
                labelStyle={{
                  color: 'hsl(var(--popover-foreground))',
                  fontWeight: '500'
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={getTrendColor()}
                strokeWidth={3}
                dot={{ stroke: getTrendColor(), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodChart;
