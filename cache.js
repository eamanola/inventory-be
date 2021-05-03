const CACHE_FOR = 5 * 60 * 60 * 1000;

const cache = {};

const get = (key) => {
  let ret;
  if (!cache[key]) {
    ret = null;
  } else if (cache[key].expires < (new Date()).getTime()) {
    delete cache[key];
    ret = null;
  } else {
    ret = cache[key].data;
  }

  return ret;
};

const set = (key, data) => {
  cache[key] = {
    expires: (new Date()).getTime() + CACHE_FOR,
    data,
  };
};

module.exports = { get, set };
