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

export default function VegNonVegPieChart({
  zomatoOrders,
}: {
  zomatoOrders: ZomatoOrder[];
}) {
  const [chartData, setChartData] = React.useState<
    { name: string; value: number; color: string }[]
  >([]);

  useEffect(() => {
    let allItems: Dish[] = [];

    zomatoOrders.forEach((order) => {
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

    setChartData([
      {
        name: 'Veg',
        value: vegItems.length,
        color: '#8884d8',
      },
      {
        name: 'Non-Veg',
        value: nonVegItems.length,
        color: '#43416e',
      },
      {
        name: 'Egg',
        value: eggItems.length,
        color: '#706db5',
      },
    ]);
  }, [zomatoOrders]);

  return (
    <div className="">
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
