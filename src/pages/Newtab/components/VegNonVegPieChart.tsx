import React, { PureComponent, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Dish, ZomatoOrder } from '../../../types';
import { filterTypes } from './OrderHistoryLineChart';

export default function VegNonVegPieChart({
  onlineOrders,
}: {
  onlineOrders: ZomatoOrder[];
}) {
  const [selectedFilterType, setSelectedFilterType] = React.useState<number>(1);

  const [chartData, setChartData] = React.useState<
    { name: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    let allItems: Dish[] = [];

    onlineOrders.forEach((order) => {
      order.details.order.items.dish?.forEach((dish) => {
        allItems.push(dish);
      });
    });

    allItems = allItems.filter((item) => !item.isCancelled);

    const vegItems = allItems.filter((item) => item.tagSlugs?.includes('veg'));
    const nonVegItems = allItems.filter((item) =>
      item.tagSlugs?.includes('non-veg')
    );
    const eggItems = allItems.filter((item) => item.tagSlugs?.includes('egg'));

    console.log('allItems', allItems, vegItems, nonVegItems, eggItems);

    const vegItemsTotalCost = vegItems.reduce(
      (acc, item) => acc + item.totalCost,
      0
    );
    const nonVegItemsTotalCost = nonVegItems.reduce(
      (acc, item) => acc + item.totalCost,
      0
    );
    const eggItemsTotalCost = eggItems.reduce(
      (acc, item) => acc + item.totalCost,
      0
    );

    setChartData([
      {
        name: 'Veg',
        value: selectedFilterType === 2 ? vegItemsTotalCost : vegItems.length,
        color: '#8884d8',
      },
      {
        name: 'Non-Veg',
        value:
          selectedFilterType === 2 ? nonVegItemsTotalCost : nonVegItems.length,
        color: '#43416e',
      },
      {
        name: 'Egg',
        value: selectedFilterType === 2 ? eggItemsTotalCost : eggItems.length,
        color: '#706db5',
      },
    ]);
  }, [onlineOrders, selectedFilterType]);

  return (
    <div className="flex flex-col w-full items-center">
      <select
        className="select w-full max-w-xs mr-10 mb-1 select-primary"
        value={selectedFilterType}
        onChange={(e) => {
          setSelectedFilterType(Number(e.target.value));
        }}
      >
        {filterTypes.map((filterType) => (
          <option value={filterType.value}>{filterType.label}</option>
        ))}
      </select>

      <ResponsiveContainer width="100%" height={450}>
        <PieChart width={500} height={500}>
          <Pie dataKey="value" data={chartData} fill="#82ca9d">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
