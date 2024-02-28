import { store } from 'store/index';
import { UsdConversionApiBaseURL } from 'theme/Helper/constant';
import { ExistingNetworksItem } from 'types/apiResponseInterfaces';

import { getUSDPrice } from './apiActions';

const USDConversionService = () => {
  const API_BASE_URL = UsdConversionApiBaseURL;
  let intervals: NodeJS.Timeout[] = [];

  // Create an AbortController instance
  const controller = new AbortController();

  async function fetchUSDPrice({ item }: { item: ExistingNetworksItem[] }) {
    const requestConfig = {
      ids: Object.values(item)
        .map(entry => entry.coingeckoTokenId)
        .join(','),
      vs_currencies: 'USD',
      include_24hr_change: true,
    };

    return await callUSDPriceConversionApi(requestConfig, item);
  }

  const callUSDPriceConversionApi = async (
    requestConfig: {
      ids: string;
      vs_currencies: string;
      include_24hr_change: boolean;
    },
    item: ExistingNetworksItem[],
  ) => {
    let usdValueAndShortNameArray = [];
    const queryParam = new URLSearchParams(requestConfig).toString();
    try {
      // Obtain a reference to the AbortSignal
      const signal = controller.signal;

      const response = await fetch(`${API_BASE_URL}${queryParam}`, {
        signal,
      });

      const data = await response?.json();

      for (let obj of item) {
        if (data[obj.coingeckoTokenId]?.usd) {
          usdValueAndShortNameArray.push({
            usdAmount: data[obj.coingeckoTokenId]?.usd ?? 0,
            shortName: obj.shortName,
            oneDayUSDPriceChangePercentage:
              data[obj.coingeckoTokenId]?.usd_24h_change ?? 0,
          });
        }
      }
      return usdValueAndShortNameArray;
    } catch (error) {
      console.log('error', error);
      return [
        {
          error: 'something went wrong!!',
          shortName: 'error',
          usdAmount: 0,
          oneDayUSDPriceChangePercentage: 0,
        },
      ];
    }
  };

  const startUSDPriceObserver = (item: ExistingNetworksItem[]) => {
    controller.abort();
    store.dispatch(
      getUSDPrice({
        item: item,
      }),
    );

    const currentInterval = setInterval(() => {
      controller.abort();
      store.dispatch(
        getUSDPrice({
          item: item,
        }),
      );
    }, 60000);

    intervals.push(currentInterval);
  };

  const removeListeners = () => {
    controller.abort();
    intervals.forEach(value => clearInterval(value));
    intervals = [];
  };

  return { startUSDPriceObserver, fetchUSDPrice, removeListeners };
};

export default USDConversionService;
