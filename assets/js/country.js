let linerChart = null;

function buildLineGraph(daysLabel, daysData) {
  console.log(daysLabel, daysData);

  const data = {
    labels: daysLabel,
    datasets: [{
      label: '',
      data: daysData,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const config = {
    type: 'line',
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Curva diária de Covid-19'
        }
      }
    }
  };

  if(linerChart) {
    linerChart.destroy();
  }

  linerChart = new Chart(
    document.getElementById('linhas'),
    config
  );
}

async function getCountryStatus(country = 'brazil', dateTo, dateFrom, dataType = 'Deaths') {

  const filterFrom = dateFrom instanceof Date ? dateFrom.toISOString() : '2020-02-29T00:00:00Z';
  const filterTo = dateTo instanceof Date ? dateTo.toISOString() : '2020-04-01T00:00:00Z';
  const dates = `from=${filterFrom}&to=${filterTo}`;
console.log(dates, dateTo, dateFrom);
  return await axios.get(`https://api.covid19api.com/country/${country}?${dates}`).then((responce) => {
    if(responce.status === 200) {

      const daysLabel = [];
      const dataDays = {
        Confirmed: [],
        Deaths: [],
        Recovered: []
      }
      
      console.log(responce.data);
      for(let i = 0; i < responce.data.length - 1; i++) {
        const day = responce.data[i+1];
        const dayBefore = responce.data[i];
        
        const dayLabel = new Date(day.Date);
        dayLabel.setDate(dayLabel.getDate() + 1);
        daysLabel.push(dayLabel.toLocaleDateString());

        const dayRecovered = day.Recovered - dayBefore.Recovered;
        dataDays.Recovered.push(dayRecovered);

        const dayDeath = day.Deaths - dayBefore.Deaths;
        dataDays.Deaths.push(dayDeath);

        const dayConfirmed = day.Confirmed - dayBefore.Confirmed;
        dataDays.Confirmed.push(dayConfirmed);
      }

      buildLineGraph(daysLabel, dataDays[dataType]);

      document.getElementById('kpiconfirmed').innerHTML = Number(_.sum(dataDays.Confirmed)).toLocaleString();
      document.getElementById('kpideaths').innerHTML = Number(_.sum(dataDays.Deaths)).toLocaleString();
      document.getElementById('kpirecovered').innerHTML = Number(_.sum(dataDays.Recovered)).toLocaleString();
    }
  }).catch((error) => console.log(error));
}

function loadCountrys(countryList) {
  const countryListOrdered = _.orderBy(countryList, [(country) => country.Country], ['asc']);

  let countrysHtml = '';

  for(let country of countryListOrdered) {
    countrysHtml += `<option ${country.Slug === 'brazil' ? 'selected' : ''} value="${country.Slug}">${country.Country}</option>`;
  }

  document.getElementById('cmbCountry').innerHTML = countrysHtml;
  document.getElementById('date_start').value = '2020-03-01';
  document.getElementById('date_end').value = '2020-04-01';
}

function applyFilters() {
  const dateFrom = new Date(document.getElementById('date_start').value);
  const dateTo = new Date(document.getElementById('date_end').value);

  const newDateFrom = new Date(
    dateFrom.getFullYear(),
    dateFrom.getMonth(),
    dateFrom.getDate() + 1,
    -3,
    0,
    1,
    0
  );

  const newDateTo = new Date(
    dateTo.getFullYear(),
    dateTo.getMonth(),
    dateTo.getDate() + 1,
    -3,
    0,
    1,
    0
  );

  console.log(newDateFrom, newDateTo);

  const dataType = document.getElementById('cmbData').value;
  const country = document.getElementById('cmbCountry').value;

  getCountryStatus(country, newDateTo, newDateFrom, dataType);
}

(async () => {
  await axios.get('https://api.covid19api.com/countries').then(async (responce) => {
    if(responce.status === 200) {
      const jsonData = responce.data;

      loadCountrys(jsonData);
      await getCountryStatus();

      document.getElementById('filtro').addEventListener('click', applyFilters);
    }
  }).catch((error) => console.log(error));
}) ();