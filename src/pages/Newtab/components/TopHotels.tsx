import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { IHighestOrder } from '../../../types';

export default function TopHotels({ data }: { data: IHighestOrder[] }) {
  return (
    <ResponsiveContainer width="100%" height="40%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="totalCost" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
