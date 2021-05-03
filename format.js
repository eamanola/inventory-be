const combine = (categoryData, manufacturersData) => {
  const ret = categoryData.map((item) => {
    const manufacturerInfo = manufacturersData[item.manufacturer]
      .find((i) => i.id.toUpperCase() === item.id.toUpperCase());

    return { ...item, manufacturerInfo };
  });

  return ret;
};

const filterByManufacturerInfo = (data) => data.filter((item) => item.manufacturerInfo);

const parseAvailability = (data) => data.map((item) => {
  // 'INSTOCK', 'OUTOFSTOCK', 'LESSTHAN10'
  let availability = 'UNKNOWN';

  if (item.manufacturerInfo) {
    const { DATAPAYLOAD } = item.manufacturerInfo;
    if (DATAPAYLOAD) {
      const match = DATAPAYLOAD.match(/<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/);
      if (match != null) {
        [, availability] = match;
      }
    }
  }

  return { ...item, availability };
});

const formatData = (categoryData, manufacturersData) => {
  let data = combine(categoryData, manufacturersData);
  data = filterByManufacturerInfo(data);
  data = parseAvailability(data);

  return data.map((item) => ({
    id: item.id,
    type: item.type,
    name: item.name,
    manufacturer: item.manufacturer,
    availability: item.availability,
    debug: { ...item },
  }));
};

module.exports = formatData;
