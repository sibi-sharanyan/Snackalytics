import currency from 'currency.js';
import React, { useEffect } from 'react';
import '../../assets/styles/tailwind.css';
import { Dish, IHighestOrder, ZomatoOrder } from '../../types';
import dayjs from 'dayjs';
import TopHotels from './components/TopHotels';
import OrderHistoryLineChart from './components/OrderHistoryLineChart';
import VegNonVegPieChart from './components/VegNonVegPieChart';

const Newtab = () => {
  const [zomatoOrders, setZomatoOrders] = React.useState<ZomatoOrder[]>([]);
  const [uniqueHotels, setUniqueHotels] = React.useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = React.useState<string>('');
  const [totalCost, setTotalCost] = React.useState<string>('');
  const [orderCount, setOrderCount] = React.useState<number>(0);
  const [items, setItems] = React.useState<Dish[]>([]);
  const [medianOrderCost, setMedianOrderCost] = React.useState<string>('');
  const [averageOrderCost, setAverageOrderCost] = React.useState<string>('');

  useEffect(() => {
    chrome.storage.local.get(
      ['zomatoOrders', 'reportGeneratedOn'],
      (result) => {
        console.log(
          'Value currently is ',
          JSON.parse(result.zomatoOrders),
          result.reportGeneratedOn
        );
        if (result.zomatoOrders) {
          setZomatoOrders(JSON.parse(result.zomatoOrders));
        }
      }
    );
  }, []);

  useEffect(() => {
    calculateTotal();

    const allItems: Dish[] = [];
    zomatoOrders.forEach((order) => {
      order.details.order.items.dish?.forEach((dish) => {
        allItems.push(dish);
      });
    });

    const orderCosts = zomatoOrders.map(
      (order) => order.details.order.totalCost
    );
    const medianOrderCost = orderCosts.sort((a, b) => a - b)[
      Math.floor(orderCosts.length / 2)
    ];

    setMedianOrderCost(
      currency(medianOrderCost).format({
        symbol: '₹',
      })
    );

    setItems(allItems);
  }, [zomatoOrders]);

  useEffect(() => {
    const uniqueHotels = zomatoOrders
      .map((order) => order.details.resInfo.name)
      .filter((value, index, self) => self.indexOf(value) === index);
    setUniqueHotels(uniqueHotels);
  }, [zomatoOrders]);

  const calculateTotal = (hotel?: string) => {
    let finalTotalPrice = 0;

    zomatoOrders.forEach((order) => {
      const { details } = order;

      if (!hotel) {
        finalTotalPrice += details.order.totalCost;
      } else {
        if (details.resInfo.name === hotel) {
          finalTotalPrice += details.order.totalCost;
        }
      }
    });

    setTotalCost(
      currency(finalTotalPrice).format({
        symbol: '₹',
      })
    );

    setAverageOrderCost(
      currency(finalTotalPrice / zomatoOrders.length).format({
        symbol: '₹',
      })
    );

    setOrderCount(zomatoOrders.length);
  };

  return (
    <div
      className=" flex p-28 h-screen mx-auto max-w-screen-2xl"
      // style={{
      //   maxWidth: '1800px',
      // }}
    >
      <div className="flex-col space-y-20 w-full h-full">
        <select
          className="select w-full max-w-xs mr-10 select-primary"
          value={selectedHotel}
          onChange={(e) => {
            setSelectedHotel(e.target.value);
          }}
        >
          <option value={''} disabled>
            Pick Hotel
          </option>
          {uniqueHotels.map((hotel) => (
            <option value={hotel}>{hotel}</option>
          ))}
        </select>
        <div className="flex w-full">
          <div className="flex w-1/2">
            <div className="space-y-10 shadow-lg p-6">
              <div className="">
                <div className="text-lg">Total Money Spent</div>
                <div className="text-6xl font-bold">{totalCost}</div>
              </div>

              <div className="flex justify-between items-start">
                <div className="">
                  <div className="text-lg">Total Orders</div>
                  <div className="text-5xl font-bold">{orderCount}</div>
                </div>

                <div className="">
                  <div className="text-lg">Total Restaurants</div>
                  <div className="text-5xl font-bold">
                    {uniqueHotels.length}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-start">
                <div className="">
                  <div className="text-lg">Total Items Ordered</div>
                  <div className="text-5xl font-bold">{items.length}</div>
                </div>

                <div className="space-y-4">
                  <div className="">
                    <div className="text-sm">Median Order Cost</div>
                    <div className="text-xl font-bold">{medianOrderCost}</div>
                  </div>
                  <div className="">
                    <div className="text-sm">Average Order Cost</div>
                    <div className="text-xl font-bold">{averageOrderCost}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2">
            <VegNonVegPieChart zomatoOrders={zomatoOrders} />
          </div>
        </div>

        <OrderHistoryLineChart zomatoOrders={zomatoOrders} />
        <TopHotels
          zomatoOrders={zomatoOrders}
          items={items}
          uniqueHotels={uniqueHotels}
        />
      </div>
    </div>
  );
};

export default Newtab;
