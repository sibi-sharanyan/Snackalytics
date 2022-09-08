import currency from 'currency.js';
import React, { useEffect } from 'react';
import '../../assets/styles/tailwind.css';
import { IHighestOrder, ZomatoOrder } from '../../types';
import TopHotels from './components/TopHotels';

const Newtab = () => {
  const [zomatoOrders, setZomatoOrders] = React.useState<ZomatoOrder[]>([]);
  const [uniqueHotels, setUniqueHotels] = React.useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = React.useState<string>('');
  const [highestOrders, setHighestOrders] = React.useState<IHighestOrder[]>([]);
  const [mostSpentHotels, setMostSpentHotels] = React.useState<IHighestOrder[]>(
    []
  );
  const [mostFrequentlyOrderedHotels, setMostFrequentlyOrderedHotels] =
    React.useState<IHighestOrder[]>([]);

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

    // get top 10 highest cost hotels by totalCost
    let topHighestOrders = zomatoOrders
      .sort((a, b) => b.details.order.totalCost - a.details.order.totalCost)
      .slice(0, 5)
      .map((order) => {
        return {
          name: order.details.resInfo.name,
          totalCost: order.details.order.totalCost,
        };
      });

    //get array of objects with resInfo.name and sum of totalCost
    const mostOrderedHotels = uniqueHotels
      .map((hotel) => {
        const totalCost = zomatoOrders
          .filter((order) => order.details.resInfo.name === hotel)
          .reduce((acc, order) => acc + order.details.order.totalCost, 0);
        return {
          name: hotel,
          totalCost,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);

    const _mostFrequentlyOrderedHotels = uniqueHotels
      .map((hotel) => {
        const totalCost = zomatoOrders.filter(
          (order) => order.details.resInfo.name === hotel
        ).length;
        return {
          name: hotel,
          totalCost,
        };
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);

    setHighestOrders(topHighestOrders);
    setMostFrequentlyOrderedHotels(_mostFrequentlyOrderedHotels);
    setMostSpentHotels(mostOrderedHotels);

    console.log('topHighestOrders', mostOrderedHotels);
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
    <div className="bg-gray-300 h-screen flex p-28">
      <div className="flex-col space-y-20 w-full">
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

        {/* <TopHotels data={highestOrders} /> */}
        <TopHotels data={mostSpentHotels} />
        <TopHotels data={mostFrequentlyOrderedHotels} />
      </div>
    </div>
  );
};

export default Newtab;
