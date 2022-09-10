import dayjs from 'dayjs';
import React, { PureComponent, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { IHighestOrder, ZomatoOrder } from '../../../types';

const timeRanges = [
  {
    label: 'Last 30 days',
    value: 1,
  },
  {
    label: 'Last 12 months',
    value: 2,
  },
  {
    label: 'Last 24 months',
    value: 3,
  },
  {
    label: 'All time',
    value: 4,
  },
];

export const filterType = [
  {
    label: 'By Orders Placed',
    value: 1,
  },
  {
    label: 'By Money Spent',
    value: 2,
  },
];

export default function OrderHistoryLineChart({
  zomatoOrders,
}: {
  zomatoOrders: ZomatoOrder[];
}) {
  const [chartData, setChartData] = React.useState<
    { time: string; value: number }[]
  >([]);

  const [selectedTimeRange, setSelectedTimeRange] = React.useState<number>(1);
  const [selectedFilterType, setSelectedFilterType] = React.useState<number>(1);

  useEffect(() => {
    if (selectedTimeRange === 1) {
      const last30Days = zomatoOrders.filter((order) => {
        const orderDate = dayjs(order.details.orderDate.split('at')[0]);
        return orderDate.isAfter(dayjs().subtract(30, 'day'));
      });

      console.log('last30Days', last30Days);

      const chartData = last30Days.reduce((acc, order) => {
        const orderDate = dayjs(order.details.orderDate.split('at')[0]);
        const existingData = acc.find(
          (data) => data.time === orderDate.format('DD MMM')
        );
        if (existingData) {
          existingData.value += 1;
        } else {
          acc.push({
            time: orderDate.format('DD MMM'),
            value: 1,
          });
        }
        return acc;
      }, [] as { time: string; value: number }[]);

      setChartData(chartData);
    } else if (selectedTimeRange === 4) {
      const oldestOrder = zomatoOrders.sort((a, b) => {
        return (
          dayjs(a.details.orderDate.split('at')[0]).unix() -
          dayjs(b.details.orderDate.split('at')[0]).unix()
        );
      })[0];

      const oldestDate = dayjs(oldestOrder.details.orderDate.split('at')[0]);

      const currentDate = dayjs();

      const months = currentDate.diff(oldestDate, 'month');

      const chartData = [];

      console.log('months', months, oldestDate.format());

      for (let i = 0; i < months; i++) {
        const month = oldestDate.add(i, 'month').format('MMM YYYY');
        console.log('month', month);
        const orders = zomatoOrders.filter((order) => {
          return (
            dayjs(order.details.orderDate.split('at')[0]).format('MMM YYYY') ===
            month
          );
        });

        const finalValue =
          selectedFilterType === 1
            ? orders.length
            : orders.reduce(
                (acc, order) => acc + order.details.order.totalCost,
                0
              );

        chartData.push({
          time: month,
          value: finalValue,
        });
      }

      console.log('chartData', chartData);

      setChartData(chartData);
    } else if (selectedTimeRange === 2 || selectedTimeRange === 3) {
      const last12Months = Array.from(
        { length: selectedTimeRange === 2 ? 12 : 24 },
        (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return dayjs(date).format('MMM YYYY');
        }
      );

      const pastOrdersData = last12Months.map((month) => {
        const orders = zomatoOrders.filter((order) => {
          return (
            dayjs(order.details.orderDate.split('at')[0]).format('MMM YYYY') ===
            month
          );
        });

        const finalValue =
          selectedFilterType === 1
            ? orders.length
            : orders.reduce(
                (acc, order) => acc + order.details.order.totalCost,
                0
              );

        return {
          value: finalValue,
          time: month,
        };
      });

      setChartData(pastOrdersData.reverse());
    }
  }, [zomatoOrders, selectedTimeRange, selectedFilterType]);

  return (
    <div className="">
      <div className="flex mb-10">
        <select
          className="select w-full max-w-xs mr-10 "
          value={selectedTimeRange}
          onChange={(e) => {
            setSelectedTimeRange(Number(e.target.value));
          }}
        >
          {timeRanges.map((timeRange) => (
            <option value={timeRange.value}>{timeRange.label}</option>
          ))}
        </select>

        <select
          className="select w-full max-w-xs mr-10 mb-6"
          value={selectedFilterType}
          onChange={(e) => {
            setSelectedFilterType(Number(e.target.value));
          }}
        >
          {filterType.map((filterType) => (
            <option value={filterType.value}>{filterType.label}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart width={300} height={100} data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={2}
          />
          <XAxis dataKey="time" />
          <YAxis dataKey="value" />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
