const express = require('express');
const cors = require('cors');

const app = express();

const fetchData = require('./fetch');
const formatData = require('./format');

app.use(cors());
app.use(express.json());
app.use(express.static('inventory-fe/build'));

app.get('/category/:category', async (request, response) => {
  const { category } = request.params;
  const validValues = ['gloves', 'facemasks', 'beanies'];

  if (validValues.indexOf(category) === -1) {
    return response.status(400).json({
      error: `invalid category. valid values are ${validValues.join(', ')}`,
    });
  }

  const [categoryData, manufacturersData] = await fetchData(category);
  const data = formatData(categoryData, manufacturersData);
  return response.status(200).json(data);
});

const PORT = 3002;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
