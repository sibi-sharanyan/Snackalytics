import currency from 'currency.js';
import React, { useEffect } from 'react';
import '../../assets/styles/tailwind.css';
import { IHighestOrder, ZomatoOrder } from '../../types';
import dayjs from 'dayjs';
import TopHotels from './components/TopHotels';
import OrderHistoryLineChart from './components/OrderHistoryLineChart';

const Newtab = () => {
  const [zomatoOrders, setZomatoOrders] = React.useState<ZomatoOrder[]>([]);
  const [uniqueHotels, setUniqueHotels] = React.useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = React.useState<string>('');

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

    alert(
      `Total Price: ${currency(finalTotalPrice).format({
        symbol: '₹',
      })}`
    );
  };

  return (
    <div className=" flex p-28 h-screen">
      <div className="flex-col space-y-20 w-full h-full">
        <div className="flex">
          <select
            className="select w-full max-w-xs mr-10"
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

          <div
            className="btn btn-secondary"
            onClick={() => calculateTotal(selectedHotel)}
          >
            Calculate total
          </div>
        </div>

        <TopHotels zomatoOrders={zomatoOrders} uniqueHotels={uniqueHotels} />
        <OrderHistoryLineChart zomatoOrders={zomatoOrders} />
      </div>
    </div>
  );
};

export default Newtab;
