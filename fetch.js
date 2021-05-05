const axios = require('axios');

const cache = require('./cache');
const {
  IS_DEV,
  CATEGORIES_EP,
  AVAILABILITY_EP,
  MAX_TRIES,
} = require('./config');

const forceError = IS_DEV && false;
const headers = forceError ? { 'x-force-error-mode': 'allto' } : {};

const fetchCategory = async (category) => {
  let data = cache.get(category);
  if (data === null) {
    const response = await axios.get(`${CATEGORIES_EP}/${category}`, {
      headers,
    });
    data = response.data;
    cache.set(category, data);

    // eslint-disable-next-line no-console
    console.log(category, 'from server');
  } else {
    // eslint-disable-next-line no-console
    console.log(category, 'from cache');
  }

  return data;
};

const manufacturersFromCache = (manufacturersList) => {
  const data = {};
  const notFound = [];
  manufacturersList.forEach((manufacturer) => {
    const manufacturerData = cache.get(manufacturer);
    if (manufacturerData === null) {
      notFound.push(manufacturer);
    } else {
      // eslint-disable-next-line no-console
      console.log(manufacturer, 'from cache');
      data[manufacturer] = manufacturerData;
    }
  });

  return [data, notFound];
};

const manufacturersFromServer = async (manufacturersList) => {
  const data = {};
  const fails = [];

  const promises = manufacturersList
    .map((manufacturer) => axios.get(`${AVAILABILITY_EP}/${manufacturer}`, {
      headers,
    }));

  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    const { url } = response.config;

    const manufacturer = url.split('/').pop();
    const manufacturerData = IS_DEV ? response.data : response.data.response;

    if (manufacturerData instanceof Array) {
      data[manufacturer] = manufacturerData;
      cache.set(manufacturer, manufacturerData);

      // eslint-disable-next-line no-console
      console.log(manufacturer, 'from server');
    } else {
      fails.push(manufacturer);
    }
  });

  return [data, fails];
};

const fetchManufacturers = async (manufacturersList, retries = MAX_TRIES) => {
  let data = {};

  const [fromCache, notFound] = manufacturersFromCache(manufacturersList);
  data = { ...data, ...fromCache };

  const [fromServer, fails] = await manufacturersFromServer(notFound);
  data = { ...data, ...fromServer };

  // handle fails
  if (fails.length > 0) {
    if (retries > 0) {
      // eslint-disable-next-line no-console
      console.log(`${retries} retries left, ${fails.join(', ')}`);
      const manufacturersData = await fetchManufacturers(fails, retries - 1);
      data = { ...data, ...manufacturersData };
    } else {
      fails.forEach((manufacturer) => {
        // no can do, try again later :/
        // eslint-disable-next-line no-console
        console.log(`${manufacturer} couldnt recover in ${MAX_TRIES} tries`);
        data[manufacturer] = [];
      });
    }
  }

  return [data, fails];
};

const fetchData = async (category) => {
  const categoryData = await fetchCategory(category);

  const manufacturers = [
    ...new Set(categoryData.map((item) => item.manufacturer)),
  ];
  const [manufacturersData, fails] = await fetchManufacturers(manufacturers);

  return [categoryData, manufacturersData, fails];
};

module.exports = fetchData;
