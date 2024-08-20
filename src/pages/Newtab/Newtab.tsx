import currency from 'currency.js';
import React, { useEffect } from 'react';
import '../../assets/styles/tailwind.css';
import { Dish, IHighestOrder, OnlineOrder, OrderApp } from '../../types';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import TopHotels from './components/TopHotels';
import OrderHistoryLineChart from './components/OrderHistoryLineChart';
import VegNonVegPieChart from './components/VegNonVegPieChart';

import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import DatePicker, { DayRange } from 'react-modern-calendar-datepicker';
import SocialHandle from '../common/SocialHandle';

dayjs.extend(customParseFormat);

const Newtab = () => {
  const [onlineOrders, setOnlineOrders] = React.useState<OnlineOrder[]>([]);
  const [isToastHidden, setIsToastHidden] = React.useState<boolean>(false);
  const [onlineAllOrders, setAllOnlineOrders] = React.useState<OnlineOrder[]>(
    []
  );

  const [selectedDayRange, setSelectedDayRange] = React.useState<DayRange>({
    from: null,
    to: null,
  });
  const [selectedDayRangeDayJs, setSelectedDayRangeDayJs] = React.useState<{
    from: dayjs.Dayjs | null;
    to: dayjs.Dayjs | null;
  }>({
    from: null,
    to: null,
  });
  const [allOrders, setAllOrders] = React.useState<OnlineOrder[]>([]);
  const [uniqueHotels, setUniqueHotels] = React.useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = React.useState<string>('');
  const [totalCost, setTotalCost] = React.useState<string>('');
  const [orderCount, setOrderCount] = React.useState<number>(0);
  const [items, setItems] = React.useState<Dish[]>([]);
  const [medianOrderCost, setMedianOrderCost] = React.useState<string>('');
  const [averageOrderCost, setAverageOrderCost] = React.useState<string>('');
  const [selectedOrderApp, setSelectedOrderApp] = React.useState<number>(-1);
  const [orderApps, setOrderApps] = React.useState<
    {
      label: string;
      value: number;
    }[]
  >([]);

  const renderCustomInput = ({ ref }: any) => (
    <input
      readOnly
      ref={ref} // necessary
      placeholder="Select a day range"
      value={
        selectedDayRange.from && selectedDayRange.to
          ? `${selectedDayRange.from?.day}/${selectedDayRange.from?.month}/${selectedDayRange.from?.year} - ${selectedDayRange.to?.day}/${selectedDayRange.to?.month}/${selectedDayRange.to?.year}`
          : ''
      }
      className="input input-bordered input-primary w-full max-w-xs"
    />
  );

  useEffect(() => {
    chrome.storage.local.get(['zomato', 'swiggy'], (result) => {
      console.log('Value currently is ', result);

      let zomatoOrders: OnlineOrder[] = JSON.parse(
        result?.zomato?.orders || '[]'
      );
      let swiggyOrders: OnlineOrder[] = JSON.parse(
        result?.swiggy?.orders || '[]'
      );

      if (zomatoOrders.length > 0) {
        setOrderApps((prev) => [
          ...prev,
          {
            label: 'Zomato',
            value: 0,
          },
        ]);
        setSelectedOrderApp(0);
      }

      if (swiggyOrders.length > 0) {
        setOrderApps((prev) => [
          ...prev,
          {
            label: 'Swiggy',
            value: 1,
          },
        ]);

        setSelectedOrderApp(1);
      }

      if (zomatoOrders.length > 0 && swiggyOrders.length > 0) {
        setOrderApps((prev) => [
          ...prev,
          {
            label: 'All',
            value: -1,
          },
        ]);

        setSelectedOrderApp(-1);
      }

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
      // console.log('allOrders', allOrders);
      setAllOrders(allOrders);
    });
  }, []);

  useEffect(() => {
    const ordersWithinRange = onlineAllOrders.filter((order) => {
      if (selectedDayRangeDayJs.from && selectedDayRangeDayJs.to) {
        if (!order.details.fullDate) {
          return false;
        }

        return (
          dayjs(order.details.fullDate).isAfter(selectedDayRangeDayJs.from) &&
          dayjs(order.details.fullDate).isBefore(selectedDayRangeDayJs.to)
        );
      }
      return true;
    });

    setOnlineOrders(ordersWithinRange);
  }, [selectedDayRangeDayJs, onlineAllOrders, setOnlineOrders]);

  useEffect(() => {
    if (selectedOrderApp === -1) {
      setOnlineOrders(allOrders);
      setAllOnlineOrders(allOrders);
    } else if (selectedOrderApp === 0) {
      setOnlineOrders(
        allOrders.filter((order) => order.orderApp === OrderApp.Zomato)
      );
      setAllOnlineOrders(
        allOrders.filter((order) => order.orderApp === OrderApp.Zomato)
      );
    } else if (selectedOrderApp === 1) {
      setOnlineOrders(
        allOrders.filter((order) => order.orderApp === OrderApp.Swiggy)
      );
      setAllOnlineOrders(
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
      currency(finalTotalPrice / onlineOrders.length || 0).format({
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
      {!isToastHidden && (
        <div className="toast toast-end toast-bottom z-50 text-md">
          <div className="alert alert-info p-1 bg-purple-300">
            <button
              className="btn btn-square btn-xs absolute top-0 left-0 m-2"
              onClick={() => {
                setIsToastHidden(true);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex justify-center items-center ">
              <div className="p-4 rounded-lg text-center bg-black text-white">
                <p className="text-xs">
                  🥺👉👈 If you found this app useful, could you please do me a tiny favor?
                </p>
                <div className="text-xs mt-2 flex justify-center items-center bg-white text-black rounded-lg p-1 w-44 mx-auto font-bold" role='button' onClick={() => {
                  chrome.tabs.create({ url: 'https://x.com/sibi_sharanyan' });
                }}>
                  Follow me on&nbsp;
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg"
                    alt="X Logo"
                    className="inline-block mx-1 h-5 w-5"
                  />
                </div>
                <p className="mt-2 text-xs">
                  So I can impress my friends with how internet-famous I am. 🥺
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {isToastHidden && (
        <div className="toast toast-end toast-bottom z-50 text-md">
          <button
            className="btn btn-square btn-md absolute -top-6 -left-6 btn-primary text-2xl"
            onClick={() => {
              setIsToastHidden(false);
            }}
          >
            <span className="text-3xl">
              🥺
            </span>
          </button>
        </div>
      )}
      <div className="flex-col space-y-20 w-full h-full">
        <div className="flex space-x-20">
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

          <div className="">
            <DatePicker
              value={selectedDayRange}
              onChange={(range) => {
                console.log(range);

                if (range.from && range.to) {
                  const fromInDayJs = dayjs(
                    `${range.from.day}/${range.from.month}/${range.from.year}`,
                    'D/M/YYYY'
                  );

                  const toInDayJs = dayjs(
                    `${range.to.day}/${range.to.month}/${range.to.year}`,
                    'D/M/YYYY'
                  );

                  setSelectedDayRangeDayJs({
                    from: fromInDayJs,
                    to: toInDayJs,
                  });
                }

                setSelectedDayRange(range);
              }}
              inputPlaceholder="Select a day range"
              renderInput={renderCustomInput}
              colorPrimary="#A500FF"
              colorPrimaryLight="#E1ACFF"
            />

            {selectedDayRange.from && selectedDayRange.to && (
              <button
                className="btn btn-link"
                onClick={() => {
                  setSelectedDayRangeDayJs({
                    from: null,
                    to: null,
                  });

                  setSelectedDayRange({
                    from: null,
                    to: null,
                  });
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

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

        <div className="pb-6">
          <SocialHandle />
        </div>
      </div>
    </div>
  );
};

export default Newtab;
