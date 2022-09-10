import React, { useEffect } from 'react';
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
import { IHighestOrder, ZomatoOrder } from '../../../types';
import { filterType } from './OrderHistoryLineChart';

export default function TopHotels({
  zomatoOrders,
  uniqueHotels,
}: {
  zomatoOrders: ZomatoOrder[];
  uniqueHotels: string[];
}) {
  const [selectedFilterType, setSelectedFilterType] = React.useState<number>(1);

  const [chartData, setChartData] = React.useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    if (selectedFilterType === 1) {
      const mostOrderedHotels = uniqueHotels
        .map((hotel) => {
          const orders = zomatoOrders.filter(
            (order) => order.details.resInfo.name === hotel
          );
          return {
            name: hotel,
            value: orders.length,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setChartData(mostOrderedHotels);
    } else if (selectedFilterType === 2) {
      const mostOrderedHotels = uniqueHotels
        .map((hotel) => {
          const totalCost = zomatoOrders
            .filter((order) => order.details.resInfo.name === hotel)
            .reduce((acc, order) => acc + order.details.order.totalCost, 0);
          return {
            name: hotel,
            value: totalCost,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      setChartData(mostOrderedHotels);
    }
  }, [zomatoOrders, uniqueHotels, selectedFilterType]);

  return (
    <div className="">
      <select
        className="select w-full max-w-xs mr-10 mb-10 select-primary"
        value={selectedFilterType}
        onChange={(e) => {
          setSelectedFilterType(Number(e.target.value));
        }}
      >
        {filterType.map((filterType) => (
          <option value={filterType.value}>{filterType.label}</option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          width={500}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barSize={40}
        >
          <XAxis dataKey="name" />
          <YAxis dataKey="value" />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
