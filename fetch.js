const axios = require('axios');

const cache = require('./cache');
const { IS_DEV, CATEGORIES_EP, AVAILABILITY_EP } = require('./config');

const fetchCategory = async (category) => {
  let data = cache.get(category);
  if (data === null) {
    const response = await axios.get(`${CATEGORIES_EP}/${category}`);
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

const manufacturers = (categoryData) => [
  ...new Set(categoryData.map((item) => item.manufacturer)),
];

const fetchManufacturers = async (manufacturersList) => {
  const data = {};
  const promises = [];

  manufacturersList.forEach((manufacturer) => {
    const manufacturerData = cache.get(manufacturer);
    if (manufacturerData === null) {
      promises.push(axios.get(`${AVAILABILITY_EP}/${manufacturer}`));

      // eslint-disable-next-line no-console
      console.log(manufacturer, 'from server');
    } else {
      data[manufacturer] = manufacturerData;

      // eslint-disable-next-line no-console
      console.log(manufacturer, 'from cache');
    }
  });

  const responses = await Promise.all(promises);
  responses.forEach((response) => {
    const { url } = response.config;
    const manufacturer = url.split('/').pop();
    const manufacturerData = IS_DEV ? response.data : response.data.response;

    if (manufacturerData instanceof Array) {
      data[manufacturer] = manufacturerData;
      cache.set(manufacturer, manufacturerData);
    } else {
      // TODO: handle Network error, with 200 status
      // retry? / try again later?
      // eslint-disable-next-line no-console
      console.log('Err:', manufacturer, manufacturerData);
      data[manufacturer] = [];
    }
  });

  return data;
};

const fetchData = async (category) => {
  const categoryData = await fetchCategory(category);
  const manufacturersList = manufacturers(categoryData);
  const manufacturersData = await fetchManufacturers(manufacturersList);

  return [categoryData, manufacturersData];
};

module.exports = fetchData;
