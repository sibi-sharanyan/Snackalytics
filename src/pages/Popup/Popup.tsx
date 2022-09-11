import React, { useEffect, useState } from 'react';
import './Popup.css';
import '../../assets/styles/tailwind.css';
import axios from 'axios';
import pLimit from 'p-limit';
import currency from 'currency.js';
import { ZomatoOrder } from '../../types';
import { Line, Circle } from 'rc-progress';

const limit = pLimit(10);

const Popup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreviousReportPresent, setIsPreviousReportPresent] =
    useState<boolean>(false);

  const [requestsMade, setRequestsMade] = useState<number>(0);
  const [totalRequestsRequired, setTotalRequestsRequired] = useState<number>(0);

  const [isZomatoTab, setIsZomatoTab] = useState<boolean>(false);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      console.log(tabs[0].url, tabs[0]);

      const url = new URL(tabs[0].url as string);

      console.log(url.hostname);

      if (url.hostname === 'www.zomato.com' || url.hostname === 'zomato.com') {
        setIsZomatoTab(true);
      }
    });

    chrome.storage.local.get(
      ['zomatoOrders', 'reportGeneratedOn'],
      (result) => {
        console.log('Value currently is ', result.reportGeneratedOn);
        if (result.zomatoOrders) {
          setIsPreviousReportPresent(true);
        }
      }
    );
  }, []);

  const generateReport = () => {
    console.log('generateReport', chrome);

    chrome.cookies.getAll(
      { url: 'https://www.zomato.com' },
      async (cookies) => {
        setIsLoading(true);
        try {
          console.log('cookies', cookies);

          const cookieMap: { [name: string]: string } = {};

          cookies.forEach((cookie) => {
            cookieMap[cookie.name] = cookie.value;
          });

          const headers = {
            authority: 'www.zomato.com',
            'sec-ch-ua':
              '"" Not A;Brand";v="99", "Chromium";v="99", "Google Chrome";v="99""',
            'x-zomato-csrft': cookieMap?.csrf,
            'accept-language': 'en-GB,en;q=0.5',
            accept: '*/*',
            cookie: `fbcity=${cookieMap?.fbcity}; fre=${cookieMap?.fre}; rd=${cookieMap?.rd}; zl=${cookieMap.zl}; fbtrack=${cookieMap?.fbtrack}; _ga=${cookieMap?._ga}; _gid=${cookieMap?._gid}; _gcl_au=${cookieMap?._gcl_au}; _fbp=${cookieMap?._fbp}; G_ENABLED_IDPS=${cookieMap?.G_ENABLED_IDPS}; zhli=${cookieMap?.zhli}; g_state=${cookieMap?.g_state}; ltv=${cookieMap?.ltv}; lty=${cookieMap?.lty}; locus=${cookieMap?.locus}; squeeze=${cookieMap?.squeeze}; orange=${cookieMap?.orange}; csrf=${cookieMap?.csrf}; PHPSESSID=${cookieMap?.PHPSESSID}; AWSALBTG=${cookieMap?.AWSALBTG}; AWSALBTGCORS=${cookieMap?.AWSALBTGCORS}; fre=${cookieMap?.fre}; rd=${cookieMap?.rd}; AWSALBTG=${cookieMap?.AWSALBTG}; AWSALBTGCORS=${cookieMap?.AWSALBTGCORS}`,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent':
              'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Mobile Safari/537.36',
            'sec-ch-ua-platform': 'Android',
            'sec-ch-ua-mobile': '?1',
          };

          const {
            data: {
              entities: { ORDER: orders },
              sections: {
                SECTION_USER_ORDER_HISTORY: { count, totalPages },
              },
            },
          } = await axios.get('https://www.zomato.com/webroutes/user/orders', {
            params: {
              page: 1,
            },
            headers,
          });

          console.log('ORDER, count totalPages', orders, count, totalPages);

          setTotalRequestsRequired(count + totalPages);

          let finalTotalCost = 0;
          const orderHashIds: string[] = [];

          const requests = Array.from(Array(totalPages).keys()).map((page) => {
            return limit(async () => {
              const {
                data: {
                  entities: { ORDER: orders },
                },
              } = await axios.get(
                'https://www.zomato.com/webroutes/user/orders',
                {
                  params: {
                    page: page + 1,
                  },
                  headers,
                }
              );

              setRequestsMade((prev) => prev + 1);

              let pageTotalCost = 0;

              for (let key in orders) {
                const order = orders[key];
                const { totalCost, hashId } = order;

                console.log(
                  'hashId, totalCost',
                  hashId,
                  totalCost,
                  currency(totalCost).value
                );

                pageTotalCost += currency(totalCost).value;
                orderHashIds.push(hashId);
              }

              finalTotalCost += pageTotalCost;

              console.log('orders', orders, page, pageTotalCost);
            });
          });

          await Promise.all(requests);

          console.log('totalCost', finalTotalCost);

          const zomatoOrders: ZomatoOrder[] = [];

          const orderRequests = orderHashIds.map((hashId) => {
            return limit(async () => {
              const { data: orderData } = await axios.get(
                'https://www.zomato.com/webroutes/order/details',
                {
                  params: {
                    hashId,
                  },
                  headers,
                }
              );

              setRequestsMade((prev) => prev + 1);

              console.log('orderData', orderData);

              zomatoOrders.push(orderData);
            });
          });

          await Promise.all(orderRequests);

          chrome.storage.local.set(
            {
              zomatoOrders: JSON.stringify(zomatoOrders),
              reportGeneratedOn: new Date().toISOString(),
            },
            () => {
              console.log('Report stored in chrome storage');
            }
          );

          setIsLoading(false);
        } catch (err) {
          console.log('cookies', cookies);
          setIsLoading(false);
        }
      }
    );
  };

  const viewReport = () => {
    chrome.tabs.create({ url: 'newtab.html' });
  };

  return (
    <div className="bg-gray-600 h-screen flex flex-col items-center space-y-10">
      {isZomatoTab && (
        <div className="w-full flex flex-col justify-center">
          {!isLoading && (
            <button
              className="btn btn-md btn-primary mt-5 w-48"
              onClick={generateReport}
            >
              Generate Report
            </button>
          )}

          {isPreviousReportPresent && !isLoading && (
            <button
              className="btn btn-md btn-secondary mt-5 w-48"
              onClick={viewReport}
            >
              View Report
            </button>
          )}
        </div>
      )}

      {!isZomatoTab && (
        <div className="w-full flex flex-col justify-center">
          <p className="text-white text-center text-lg">
            Please open Zomato in a new tab, login to your account and click on
            the extension icon
          </p>
        </div>
      )}

      {/* <div>
        <div className="">
          <div className="">
            Percentage{' '}
            {Math.round((requestsMade / totalRequestsRequired) * 100)}{' '}
          </div>

          <div className="">totalRequestsRequired: {totalRequestsRequired}</div>

          <div className="">requestsMade: {requestsMade}</div>
        </div>
      </div> */}

      {isLoading && (
        <Circle
          percent={Math.round((requestsMade / totalRequestsRequired) * 100)}
          strokeWidth={7}
          strokeColor="#43416e"
        />
      )}
    </div>
  );
};

export default Popup;
