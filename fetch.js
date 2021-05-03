let baseUrl = 'https://bad-api-assignment.reaktor.com';
let categoriesEP = `${baseUrl}/v2/products`;
let manufacturerEP = `${baseUrl}/v2/availability`;
const axios = require('axios');

if (process.env.NODE_ENV === 'development') {
  baseUrl = 'http://localhost:3001';
  categoriesEP = baseUrl;
  manufacturerEP = baseUrl;
}

const fetchCategory = async (category) => {
  const response = await axios.get(`${categoriesEP}/${category}`);
  const { data } = response;

  return data;
};

const manufacturersList = (categoryData) => {
  const manufacturers = categoryData.map((item) => item.manufacturer);
  return [...new Set(manufacturers)];
};

const fetchManufacturers = async (manufacturers) => {
  const data = {};
  for (let i = 0, il = manufacturers.length; i < il; i += 1) {
    const manufacturer = manufacturers[i];
    const manufacturerData = (await axios.get(`${manufacturerEP}/${manufacturer}`)).data;

    data[manufacturer] = manufacturerData;
  }

  return data;
};

const fetchData = async (category) => {
  const categoryData = await fetchCategory(category);
  const manufacturers = manufacturersList(categoryData);
  const manufacturersData = await fetchManufacturers(manufacturers);

  return [categoryData, manufacturersData];
};

module.exports = fetchData;
