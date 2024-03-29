import React, { useEffect, useState } from 'react';
import './Popup.css';
import '../../assets/styles/tailwind.css';
import axios from 'axios';
import pLimit from 'p-limit';
import currency from 'currency.js';
import { OnlineOrder } from '../../types';
import { Circle } from 'rc-progress';

import {
  BsFillHeartFill,
  BsGithub,
  BsLinkedin,
  BsTwitter,
  BsInfoCircleFill,
} from 'react-icons/bs/index';

import customParseFormat from 'dayjs/plugin/customParseFormat';
import dayjs from 'dayjs';
import SocialHandle from '../common/SocialHandle';

dayjs.extend(customParseFormat);

const limit = pLimit(10);
const ZOMATO_ORDER_QUERY_LIMIT = 500;
const Popup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreviousReportPresent, setIsPreviousReportPresent] =
    useState<boolean>(false);
  const [reportGeneratedOn, setReportGeneratedOn] = useState<string>(
    '2021-09-11T18:13:31.402Z'
  ); //initialize with a year old string, to prevent no data case

  const [requestsMade, setRequestsMade] = useState<number>(0);
  const [totalRequestsRequired, setTotalRequestsRequired] = useState<number>(0);

  const [isZomatoTab, setIsZomatoTab] = useState<boolean>(false);
  const [isSwiggyTab, setIsSwiggyTab] = useState<boolean>(false);
  const [chromeStorageUpdates, setChromeStorageUpdates] = useState(0);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
      const url = new URL(tabs[0].url as string);

      if (url.hostname === 'www.zomato.com' || url.hostname === 'zomato.com') {
        setIsZomatoTab(true);
      } else if (
        url.hostname === 'www.swiggy.com' ||
        url.hostname === 'swiggy.com'
      ) {
        setIsSwiggyTab(true);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get([isZomatoTab ? 'zomato' : 'swiggy'], (result) => {
      if (isZomatoTab && result.zomato) {
        setReportGeneratedOn(result.zomato.reportGeneratedOn);
        setIsPreviousReportPresent(true);
      } else if (isSwiggyTab && result.swiggy) {
        setReportGeneratedOn(result.swiggy.reportGeneratedOn);
        setIsPreviousReportPresent(true);
      }
    });
  }, [isZomatoTab, isSwiggyTab, chromeStorageUpdates]);

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const generateZomatoReport = () => {
    chrome.cookies.getAll(
      { url: 'https://www.zomato.com' },
      async (cookies) => {
        setIsLoading(true);
        try {
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

          setTotalRequestsRequired(count + totalPages);

          let finalTotalCost = 0;
          const orderHashIds: string[] = [];

          const requests = Array.from(Array(totalPages).keys()).map((page) => {
            return limit(async () => {
              // await delay(2000);
              try {
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

                  pageTotalCost += currency(totalCost).value;
                  orderHashIds.push(hashId);
                }

                finalTotalCost += pageTotalCost;
              } catch (error) {
                // Break the loop if any error occurs
                console.log('error', error);
              }
            });
          });

          await Promise.all(requests);

          const zomatoOrders: OnlineOrder[] = [];

          const orderRequests = orderHashIds
            .slice(0, ZOMATO_ORDER_QUERY_LIMIT)
            .map((hashId) => {
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

                zomatoOrders.push(orderData);
              });
            });

          await Promise.all(orderRequests);

          // order.details.resInfo.name
          // order.details.order.totalCost

          const zomatoOrderMinimal = zomatoOrders
            .filter((x) => x.details?.currentStatus === 'DELIVERED')
            .map((order) => {
              return {
                details: {
                  resInfo: {
                    name: order.details.resInfo.name,
                  },
                  order: {
                    totalCost: order.details.order.totalCost,
                    items: {
                      dish: order.details.order.items?.dish?.map((dish) => {
                        return {
                          itemName: dish.itemName,
                          totalCost: dish.totalCost,
                          quantity: dish.quantity,
                          tagSlugs: dish.tagSlugs,
                        };
                      }),
                    },
                  },
                  orderDate: order.details.orderDate.split('at')[0],
                  fullDate: dayjs(
                    order.details.orderDate,
                    'MMMM DD, YYYY at h:mm A'
                  ).format(),
                },
              };
            });

          chrome.storage.local.set(
            {
              zomato: {
                orders: JSON.stringify(zomatoOrderMinimal),
                reportGeneratedOn: new Date().toISOString(),
              },
            },
            () => {
              setChromeStorageUpdates((prev) => prev + 1);
              setIsLoading(false);
            }
          );
        } catch (err) {
          setIsLoading(false);
        }
      }
    );
  };

  const generateSwiggyReport = () => {
    chrome.cookies.getAll(
      { url: 'https://www.swiggy.com' },
      async (cookies) => {
        // setIsLoading(true);
        let ordersCollection: any[] = [];

        const cookieMap: { [name: string]: string } = {};

        cookies.forEach((cookie) => {
          cookieMap[cookie.name] = cookie.value;
        });

        setIsLoading(true);
        setTotalRequestsRequired(10);

        const headers = {
          authority: 'www.swiggy.com',
          'accept-language': 'en-GB,en;q=0.5',
          cookie: `__SW=${cookieMap.__SW}; _device_id=${cookieMap._device_id}; fontsLoaded=${cookieMap.fontsLoaded}; _is_logged_in=${cookieMap._is_logged_in}; _session_tid=${cookieMap._session_tid}; userLocation={"lat":"13.145925","lng":"80.233508","address":"1st Main Rd, Pukraj Nagar, Madhavaram, Chennai, Tamil Nadu 600060, India","area":"Madhavaram","id":"17377130"}; _sid=${cookieMap._sid}; adl=true`,
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent':
            'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.82 Mobile Safari/537.36',
          'sec-ch-ua-platform': 'Android',
          'sec-ch-ua-mobile': '?1',
        };

        let orderId = '';
        for (let i = 0; i < 100; i++) {
          //Swiggy limits orders
          const {
            data: {
              data: { orders, total_orders },
            },
          } = await axios.get('https://www.swiggy.com/dapi/order/all', {
            params: {
              order_id: orderId,
            },
            headers,
          });

          if (i === 0) {
            setTotalRequestsRequired(total_orders / 10);
          }

          if (orders.length === 0) {
            break;
          }

          orderId = orders.at(-1).order_id;

          ordersCollection = [...ordersCollection, ...orders];
          setRequestsMade((prev) => prev + 1);
        }

        const swiggyOrderMinimal = ordersCollection
          .filter((order) => order.order_delivery_status === 'delivered')
          .map((order) => {
            return {
              details: {
                resInfo: {
                  name: order.restaurant_name,
                },
                order: {
                  totalCost: order.order_total,
                  items: {
                    dish: order.order_items.map((dish: any) => {
                      return {
                        itemName: dish.name,
                        totalCost: Number(dish.final_price),
                        quantity: Number(dish.quantity),
                        tagSlugs: [dish.is_veg === '1' ? 'veg' : 'non-veg'],
                      };
                    }),
                  },
                },
                orderDate: dayjs(order.updated_at).format('MMM DD, YYYY'),
                fullDate: dayjs(order.order_time).format(),
              },
            };
          });

        chrome.storage.local.set(
          {
            swiggy: {
              orders: JSON.stringify(swiggyOrderMinimal),
              reportGeneratedOn: new Date().toISOString(),
            },
          },
          () => {
            setChromeStorageUpdates((prev) => prev + 1);
            setIsLoading(false);
          }
        );
      }
    );
  };

  const viewReport = () => {
    chrome.tabs.create({ url: 'newtab.html' });
  };

  const generateReport = () => {
    if (isZomatoTab) {
      generateZomatoReport();
    } else if (isSwiggyTab) {
      generateSwiggyReport();
    }
  };

  const isRecentReportAvailable =
    dayjs().diff(dayjs(reportGeneratedOn), 'minute') <= 30;

  // const isRecentReportAvailable = false;

  // console.log(
  //   'reportGeneratedOn',
  //   reportGeneratedOn,
  //   dayjs().diff(dayjs(reportGeneratedOn), 'minute'),
  //   dayjs().diff(dayjs(reportGeneratedOn), 'minute') <= 60
  // );

  return (
    <div className="bg-gray-600 h-screen flex flex-col items-center space-y-10 w-full">
      {(isZomatoTab || isSwiggyTab) && !isLoading && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <p className="text-base px-10 text-white text-center">
            Please make sure you're logged in to your account and then click the
            below button.
          </p>

          <div className="flex flex-col items-center space-y-2">
            <div
              {...(isRecentReportAvailable
                ? {
                    'data-tip':
                      'Click the view report button below to see your report. You can analyze your orders again after an hour',
                    className: 'tooltip',
                  }
                : {})}
            >
              <button
                className={`btn btn-md btn-primary mt-5 w-48 ${
                  isRecentReportAvailable ? 'btn-disabled' : ''
                }`}
                onClick={generateReport}
              >
                Analyze Orders
              </button>{' '}
            </div>
          </div>

          {isPreviousReportPresent && (
            <button
              onClick={viewReport}
              className="text-blue-300 underline cursor-pointer text-lg mt-6"
            >
              View Report
            </button>
          )}
        </div>
      )}

      {!isZomatoTab && !isSwiggyTab && (
        <div className="w-full flex flex-col justify-center px-4 h-full items-center">
          <p className="text-white text-center text-base">
            Please open{' '}
            <a
              href="https://www.zomato.com"
              target="_blank"
              className="text-blue-300 underline cursor-pointer"
              rel="noreferrer"
            >
              <code>Zomato</code>
            </a>{' '}
            or{' '}
            <a
              href="https://www.swiggy.com"
              target="_blank"
              className="text-blue-300 underline cursor-pointer"
              rel="noreferrer"
            >
              <code>Swiggy</code>
            </a>{' '}
            in a new tab, login to your account and click on the extension icon.
          </p>
          <SocialHandle />
        </div>
      )}

      {isLoading && (
        <>
          <Circle
            percent={
              Math.round((requestsMade / totalRequestsRequired) * 100) || 0
            }
            strokeWidth={6}
            className="px-10 pt-4"
            strokeColor="#43416e"
          />
          <p className="text-base px-10 text-white text-center pb-2">
            Fetching and analyzing your orders. Please wait. This may take a few
            seconds...
          </p>
        </>
      )}
    </div>
  );
};

export default Popup;
