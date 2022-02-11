function mountKPIs(json) {

  document.getElementById('confirmed').innerHTML = Number(json.TotalConfirmed).toLocaleString();
  document.getElementById('death').innerHTML = Number(json.TotalDeaths).toLocaleString();
  document.getElementById('recovered').innerHTML = Number(json.TotalRecovered).toLocaleString();

  const updateDate = new Date(json.Date);

  document.getElementById('date').innerHTML = `Data de atualização: ${updateDate.toLocaleDateString()} ${updateDate.toLocaleTimeString()}`;
}

function newCasesDistribuition(json) {

  const data = {
    labels: [
      'Confirmados',
      'Recuperados',
      'Mortes'
    ],
    datasets: [{
      label: 'Distribuição de novos casos',
      data: [json.NewConfirmed, json.NewRecovered, json.NewDeaths],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)'
      ],
      hoverOffset: 4
    }]
  };

  const config = {
    type: 'pie',
    data: data,
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Distribuição de novos casos'
        }
      }
    }
  };

  const pieChart = new Chart(
    document.getElementById('pizza'),
    config
  );
}
function top10Countrys(json) {

  const sortedCountrys = _.orderBy(json, [(country) => country.TotalDeaths], ['desc']);
  const countriesLabels = [], countriesData = [];

  for(let i = 0; i < 10; i++) {
    countriesLabels.push(sortedCountrys[i].Country);
    countriesData.push(sortedCountrys[i].TotalDeaths);
  }

  const data = {
    labels: countriesLabels,
    datasets: [{
      label: 'Número de mortes',
      data: countriesData
    }]
  };

  const config = {
    type: 'bar',
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Total de Mortes por país - Top 10'
        }
      }
    },
  };

  const barChart = new Chart(
    document.getElementById('barras'),
    config
  );
}

(async () => {
  await axios.get('https://api.covid19api.com/summary').then((responce) => {
    if(responce.status === 200) {
      const jsonData = responce.data;

      mountKPIs(jsonData.Global);
      newCasesDistribuition(jsonData.Global);
      top10Countrys(jsonData.Countries);
    }
  }).catch((error) => console.log(error));
}) ();