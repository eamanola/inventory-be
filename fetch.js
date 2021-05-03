const axios = require('axios');

const cache = require('./cache');

let baseUrl = 'https://bad-api-assignment.reaktor.com';
let categoriesEP = `${baseUrl}/v2/products`;
let manufacturerEP = `${baseUrl}/v2/availability`;

if (process.env.NODE_ENV === 'development') {
  baseUrl = 'http://localhost:3001';
  categoriesEP = baseUrl;
  manufacturerEP = baseUrl;
}

const fetchCategory = async (category) => {
  let data = cache.get(category);
  if (data === null) {
    const response = await axios.get(`${categoriesEP}/${category}`);
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

const manufacturersList = (categoryData) => {
  const manufacturers = categoryData.map((item) => item.manufacturer);
  return [...new Set(manufacturers)];
};

const fetchManufacturers = async (manufacturers) => {
  const data = {};
  const promises = [];

  manufacturers.forEach((manufacturer) => {
    const manufacturerData = cache.get(manufacturer);
    if (manufacturerData === null) {
      promises.push(axios.get(`${manufacturerEP}/${manufacturer}`));

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
    const manufacturerData = response.data;

    data[manufacturer] = manufacturerData;
    cache.set(manufacturer, manufacturerData);
  });

  return data;
};

const fetchData = async (category) => {
  const categoryData = await fetchCategory(category);
  const manufacturers = manufacturersList(categoryData);
  const manufacturersData = await fetchManufacturers(manufacturers);

  return [categoryData, manufacturersData];
};

module.exports = fetchData;
