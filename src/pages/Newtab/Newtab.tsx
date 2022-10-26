import currency from 'currency.js';
import React, { useEffect } from 'react';
import '../../assets/styles/tailwind.css';
import { Dish, IHighestOrder, OnlineOrder, OrderApp } from '../../types';
import dayjs from 'dayjs';
import TopHotels from './components/TopHotels';
import OrderHistoryLineChart from './components/OrderHistoryLineChart';
import VegNonVegPieChart from './components/VegNonVegPieChart';

export const orderApps = [
  {
    label: 'All',
    value: -1,
  },
  {
    label: 'Zomato',
    value: 0,
  },
  {
    label: 'Swiggy',
    value: 1,
  },
];

const Newtab = () => {
  const [onlineOrders, setOnlineOrders] = React.useState<OnlineOrder[]>([]);
  const [allOrders, setAllOrders] = React.useState<OnlineOrder[]>([]);
  const [uniqueHotels, setUniqueHotels] = React.useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = React.useState<string>('');
  const [totalCost, setTotalCost] = React.useState<string>('');
  const [orderCount, setOrderCount] = React.useState<number>(0);
  const [items, setItems] = React.useState<Dish[]>([]);
  const [medianOrderCost, setMedianOrderCost] = React.useState<string>('');
  const [averageOrderCost, setAverageOrderCost] = React.useState<string>('');
  const [selectedOrderApp, setSelectedOrderApp] = React.useState<number>(-1);

  useEffect(() => {
    chrome.storage.local.get(['zomato', 'swiggy'], (result) => {
      console.log('Value currently is ', result);

      let zomatoOrders: OnlineOrder[] = JSON.parse(
        result?.zomato?.orders || '[]'
      );
      let swiggyOrders: OnlineOrder[] = JSON.parse(
        result?.swiggy?.orders || '[]'
      );

      let allOrders = [
        ...zomatoOrders.map((order) => ({
          ...order,
          orderApp: OrderApp.Zomato,
        })),
        ...swiggyOrders.map((order) => ({
          ...order,
          orderApp: OrderApp.Swiggy,
        })),
      ];
      setAllOrders(allOrders);
    });
  }, []);

  useEffect(() => {
    if (selectedOrderApp === -1) {
      setOnlineOrders(allOrders);
    } else if (selectedOrderApp === 0) {
      setOnlineOrders(
        allOrders.filter((order) => order.orderApp === OrderApp.Zomato)
      );
    } else if (selectedOrderApp === 1) {
      setOnlineOrders(
        allOrders.filter((order) => order.orderApp === OrderApp.Swiggy)
      );
    }
  }, [allOrders, selectedOrderApp]);

  useEffect(() => {
    calculateTotal();

    const allItems: Dish[] = [];
    onlineOrders.forEach((order) => {
      order.details.order.items.dish?.forEach((dish) => {
        allItems.push(dish);
      });
    });

    const orderCosts = onlineOrders.map(
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
  }, [onlineOrders]);

  useEffect(() => {
    const uniqueHotels = onlineOrders
      .map((order) => order.details.resInfo.name)
      .filter((value, index, self) => self.indexOf(value) === index);
    setUniqueHotels(uniqueHotels);
  }, [onlineOrders]);

  const calculateTotal = (hotel?: string) => {
    let finalTotalPrice = 0;

    onlineOrders.forEach((order) => {
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
      currency(finalTotalPrice / onlineOrders.length).format({
        symbol: '₹',
      })
    );

    setOrderCount(onlineOrders.length);
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
          value={selectedOrderApp}
          onChange={(e) => {
            setSelectedOrderApp(Number(e.target.value));
          }}
        >
          {orderApps.map((orderApp) => (
            <option value={orderApp.value}>{orderApp.label}</option>
          ))}
        </select>

        {/* <select
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
        </select> */}
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
            <VegNonVegPieChart onlineOrders={onlineOrders} />
          </div>
        </div>

        <OrderHistoryLineChart onlineOrders={onlineOrders} />
        <TopHotels
          onlineOrders={onlineOrders}
          items={items}
          uniqueHotels={uniqueHotels}
        />
      </div>
    </div>
  );
};

export default Newtab;
