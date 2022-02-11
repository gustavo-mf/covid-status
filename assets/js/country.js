
async function getCountryStatus(country = 'brazil', dateTo, dateFrom) {

  const filterFrom = dateFrom instanceof Date ? dateFrom.toISOString() : '2020-03-01T00:00:00Z';
  const filterTo = dateTo instanceof Date ? dateTo.toISOString() : '2020-04-01T00:00:00Z';
  const dates = `from=${filterFrom}&to=${filterTo}`;

  return await axios.get(`https://api.covid19api.com/country/${country}?${dates}`).then((responce) => {
    if(responce.status === 200) {
      return responce.data;
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
}

(async () => {
  await axios.get('https://api.covid19api.com/summary').then(async (responce) => {
    if(responce.status === 200) {
      const jsonData = responce.data;

      loadCountrys(jsonData.Countries);
      const countryData = await getCountryStatus();
      console.log(countryData);
    }
  }).catch((error) => console.log(error));
}) ();