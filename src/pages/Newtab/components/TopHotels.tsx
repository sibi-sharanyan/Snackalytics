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

    if (selectedFilterType === 1) {
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
    } else if (selectedFilterType === 2) {
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
          data={chartData.map((x) => ({
            ...x,
            name: x.name.length > 20 ? x.name.slice(0, 20) + '...' : x.name,
          }))}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 40, bottom: 20 }}
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
            width={40}
            minTickGap={0}
          />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" minPointSize={2} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
