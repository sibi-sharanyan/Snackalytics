import dayjs from 'dayjs';
import React, { PureComponent, useEffect } from 'react';
import currency from 'currency.js';
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
import { IHighestOrder, OnlineOrder } from '../../../types';

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

export const filterTypes = [
  {
    label: 'By Money Spent',
    value: 1,
  },
  {
    label: 'By Orders Placed',
    value: 2,
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
  selectedFilterType,
  selectedTimeRange,
}: any) => {
  console.log(
    'active, payload, label',
    active,
    payload,
    label,
    selectedFilterType,
    selectedTimeRange
  );
  if (active && payload && payload.length) {
    if (selectedFilterType === 1) {
      return (
        <div className="bg-purple-500 border-none  text-white px-2 py-1">
          <p className="text-md">
            {dayjs(label).format(
              selectedTimeRange !== 1 ? 'MMM YYYY' : 'MMM DD, YYYY'
            )}
          </p>
          <p className="text-xl">
            {currency(payload[0].value, {
              symbol: '₹',
            }).format()}
          </p>
        </div>
      );
    } else {
      return (
        <div className="bg-purple-500 border-none  text-white px-2 py-1">
          <p className="text-md">
            {dayjs(label).format(
              selectedTimeRange !== 1 ? 'MMM YYYY' : 'MMM DD, YYYY'
            )}
          </p>
          <p className="text-xl">{payload[0].value} orders</p>
        </div>
      );
    }
  }

  return null;
};

export default function OrderHistoryLineChart({
  onlineOrders,
}: {
  onlineOrders: OnlineOrder[];
}) {
  const [chartData, setChartData] = React.useState<
    { time: string; value: number }[]
  >([]);

  const [selectedTimeRange, setSelectedTimeRange] = React.useState<number>(2);
  const [selectedFilterType, setSelectedFilterType] = React.useState<number>(1);

  useEffect(() => {
    if (selectedTimeRange === 1) {
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return dayjs(date).format('DD MMM YYYY');
      });

      console.log('last30Days', last30Days);

      const pastOrdersData = last30Days.map((day) => {
        const orders = onlineOrders.filter((order) => {
          return (
            dayjs(order.details.orderDate.split('at')[0]).format(
              'DD MMM YYYY'
            ) === day
          );
        });

        const finalValue =
          selectedFilterType === 2
            ? orders.length
            : orders.reduce(
                (acc, order) => acc + order.details.order.totalCost,
                0
              );

        return {
          value: finalValue,
          time: day.split(' ')[0] + ' ' + day.split(' ')[1],
        };
      });

      setChartData(pastOrdersData.reverse());
    } else if (selectedTimeRange === 4) {
      const oldestOrder = onlineOrders.sort((a, b) => {
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

      for (let i = 0; i <= months; i++) {
        const month = oldestDate.add(i, 'month').format('MMM YYYY');
        console.log('month', month);
        const orders = onlineOrders.filter((order) => {
          return (
            dayjs(order.details.orderDate.split('at')[0]).format('MMM YYYY') ===
            month
          );
        });

        const finalValue =
          selectedFilterType === 2
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
          date.setDate(1);
          date.setMonth(date.getMonth() - i);
          return dayjs(date).format('MMM YYYY');
        }
      );

      const pastOrdersData = last12Months.map((month) => {
        const orders = onlineOrders.filter((order) => {
          return (
            dayjs(order.details.orderDate.split('at')[0]).format('MMM YYYY') ===
            month
          );
        });

        const finalValue =
          selectedFilterType === 2
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
  }, [onlineOrders, selectedTimeRange, selectedFilterType]);

  return (
    <div className="">
      <div className="flex mb-10">
        <select
          className="select w-full max-w-xs mr-10 select-primary"
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
          className="select w-full max-w-xs mr-10 mb-6 select-primary"
          value={selectedFilterType}
          onChange={(e) => {
            setSelectedFilterType(Number(e.target.value));
          }}
        >
          {filterTypes.map((filterType) => (
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
          <Tooltip
            content={
              <CustomTooltip
                selectedFilterType={selectedFilterType}
                selectedTimeRange={selectedTimeRange}
              />
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
