const express = require('express');
const cors = require('cors');

const fetchData = require('./fetch');
const formatData = require('./format');
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('fe-build'));

console.log('test');

app.get('/category/:category', async (request, response) => {
  console.log('test2');
  const { category } = request.params;
  console.log('test3');
  const validValues = ['gloves', 'facemasks', 'beanies'];
  console.log('test4');

  if (validValues.indexOf(category) === -1) {
    console.log('test5');
    response.status(400).json({
      error: `invalid category. valid values are ${validValues.join(', ')}`,
    });

    return;
  }

  try {
    console.log('test6');
    const [categoryData, manufacturersData] = await fetchData(category);
    console.log('test7');
    const data = formatData(categoryData, manufacturersData);
    response.status(200).json(data);
  } catch (e) {
    response.status(500).json({ error: 'unknown' });
  }
});

const { PORT } = config;
app.listen(config.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
