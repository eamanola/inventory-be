require('dotenv').config();

const IS_DEV = process.env.NODE_ENV === 'development';

const BASE_URL = IS_DEV
  ? process.env.BASE_URL_DEV
  : process.env.BASE_URL;

const CATEGORIES_EP = `${BASE_URL}${IS_DEV
  ? process.env.CATEGORIES_EP_DEV
  : process.env.CATEGORIES_EP}`;

const AVAILABILITY_EP = `${BASE_URL}${IS_DEV
  ? process.env.AVAILABILITY_EP_DEV
  : process.env.AVAILABILITY_EP}`;

const MAX_TRIES = 2;

const PORT = process.env.PORT || 3002;

module.exports = {
  IS_DEV,
  CATEGORIES_EP,
  AVAILABILITY_EP,
  MAX_TRIES,
  PORT,
};
