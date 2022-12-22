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
  Text,
} from 'recharts';
import { Dish, IHighestOrder, OnlineOrder } from '../../../types';
import { filterTypes } from './OrderHistoryLineChart';
import levenshtein from 'fast-levenshtein';
import currency from 'currency.js';

export const entityTypes = [
  {
    label: 'Top Restaurants',
    value: 1,
  },
  {
    label: 'Top Dishes',
    value: 2,
  },
];

const CustomTooltip = ({ active, payload, label, selectedFilterType }: any) => {
  if (active && payload && payload.length) {
    if (selectedFilterType === 1) {
      return (
        <div className="bg-purple-500 border-none  text-white px-2 py-1">
          <p className="text-md">{label} </p>
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
          <p className="text-md">{label} </p>
          <p className="text-xl">{payload[0].value} orders</p>
        </div>
      );
    }
  }

  return null;
};

const CustomizedLabel = (props: any) => {
  const { x, y, stroke, value, name, width } = props;
  return (
    <text
      x={x + 10}
      y={y + 26}
      dy={-4}
      fill={stroke}
      fontSize={14}
      textAnchor="start"
      className="font-semibold"
    >
      {name.length > 20 ? name.slice(0, width / 10) + '...' : name}
    </text>
  );
};

export default function TopHotels({
  onlineOrders,
  items,
  uniqueHotels,
}: {
  onlineOrders: OnlineOrder[];
  items: Dish[];
  uniqueHotels: string[];
}) {
  const [selectedFilterType, setSelectedFilterType] = React.useState<number>(1);
  const [selectedEntityType, setSelectedEntityType] = React.useState<number>(1);
  const [uniqueItems, setUniqueItems] = React.useState<string[]>([]);

  const [chartData, setChartData] = React.useState<
    { name: string; value: number }[]
  >([]);

  useEffect(() => {
    const _uniqueItems = items.reduce((acc, item) => {
      if (!acc.includes(item.itemName)) {
        acc.push(item.itemName);
      }
      return acc;
    }, [] as string[]);

    setUniqueItems(_uniqueItems);

    if (selectedFilterType === 2) {
      if (selectedEntityType === 2) {
        const mostOrderedFoods = _uniqueItems
          .map((item) => {
            const _items = items.filter((_item) => _item.itemName === item);
            return {
              name: item,
              value: _items.length,
            };
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        setChartData(mostOrderedFoods);
      } else {
        const mostOrderedHotels = uniqueHotels
          .map((hotel) => {
            const orders = onlineOrders.filter(
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
      }
    } else if (selectedFilterType === 1) {
      if (selectedEntityType === 2) {
        const mostOrderedFoods = _uniqueItems
          .map((item) => {
            const totalCost = items
              .filter((_item) => _item.itemName === item)
              .reduce((acc, _item) => acc + _item.totalCost, 0);
            return {
              name: item,
              value: totalCost,
            };
          })
          .sort((a, b) => b.value - a.value)
          .slice(0, 10);

        setChartData(mostOrderedFoods);
      } else {
        const mostOrderedHotels = uniqueHotels
          .map((hotel) => {
            const totalCost = onlineOrders
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
    }
  }, [
    onlineOrders,
    uniqueHotels,
    selectedFilterType,
    selectedEntityType,
    items,
  ]);

  return (
    <div className="py-20">
      <div className="flex ">
        <select
          className="select w-full max-w-xs mr-10 mb-10 select-primary"
          value={selectedEntityType}
          onChange={(e) => {
            setSelectedEntityType(Number(e.target.value));
          }}
        >
          {entityTypes.map((entityType) => (
            <option value={entityType.value}>{entityType.label}</option>
          ))}
        </select>

        <select
          className="select w-full max-w-xs mr-10 mb-10 select-primary"
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
      <ResponsiveContainer
        width="100%"
        height={50 * chartData.length}
        debounce={50}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          barCategoryGap="20%"
          barGap={2}
          maxBarSize={10}
        >
          <XAxis hide axisLine={false} type="number" dataKey="value" />
          <YAxis
            yAxisId={0}
            dataKey={'name'}
            type="category"
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <Tooltip
            content={<CustomTooltip selectedFilterType={selectedFilterType} />}
          />
          <Bar
            dataKey="value"
            fill="#8884d8"
            minPointSize={2}
            barSize={32}
            label={<CustomizedLabel />}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
