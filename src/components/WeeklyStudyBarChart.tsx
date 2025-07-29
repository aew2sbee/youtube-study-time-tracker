"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type StudyData = {
  day: string;
  hours: number;
};

const data: StudyData[] = [
  { day: "Mon", hours: 2 },
  { day: "Tue", hours: 1.5 },
  { day: "Wed", hours: 3 },
  { day: "Thu", hours: 2.5 },
  { day: "Fri", hours: 1 },
  { day: "Sat", hours: 4 },
  { day: "Sun", hours: 2 },
];

export default function WeeklyStudyBarChart() {
  return (
    <div className="w-full h-72 p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Weekly Study Time (hours)
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis unit="h" />
          <Tooltip />
          <Bar dataKey="hours" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
