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
    <div className="">
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
