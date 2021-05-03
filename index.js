const express = require('express');
const cors = require('cors');

const app = express();

const fetchData = require('./fetch');
const formatData = require('./format');
const cache = require('./cache');

app.use(cors());
app.use(express.json());

app.get('/category/:category', async (request, response) => {
  const { category } = request.params;
  const validValues = ['gloves', 'facemasks', 'beanies'];

  if (validValues.indexOf(category) === -1) {
    return response.status(400).json({
      error: `invalid category. valid values are ${validValues.join(', ')}`,
    });
  }

  let data = cache.get(category);
  if (data === null) {
    const [categoryData, manufacturersData] = await fetchData(category);
    data = formatData(categoryData, manufacturersData);
    cache.set(category, data);

    console.log('server');
  } else {
    console.log('cache');
  }

  return response.status(200).json({ data });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
