const express = require('express');
const cors = require('cors');

const fetchData = require('./fetch');
const formatData = require('./format');
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('./inventory-fe/build'));

app.get('/category/:category', async (request, response) => {
  const { category } = request.params;
  const validValues = ['gloves', 'facemasks', 'beanies'];

  if (validValues.indexOf(category) === -1) {
    response.status(400).json({
      error: `invalid category. valid values are ${validValues.join(', ')}`,
    });

    return;
  }

  try {
    const [categoryData, manufacturersData, fails] = await fetchData(category);
    const data = formatData(categoryData, manufacturersData);
    response.status(200).json({ data, fails });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    response.status(500).json({ error: 'Something went wrong. Please try again later' });
  }
});

const { PORT } = config;
app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
