document.getElementById('calculatorForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const expression = document.getElementById('expressionInput').value;
  const encodedExpression = encodeURIComponent(expression);
  const apiUrl = `https://www.inchcalculator.com/api/calculators/feet-and-inches/?uc_length=${encodedExpression}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const result = data.results;
      document.getElementById('result').innerHTML = `
        <h2>Results</h2>
        <p><strong>Display Value:</strong> ${result.display_value}</p>
        <p><strong>Inches:</strong> ${result.inches.standard} inches</p>
        <p><strong>Feet:</strong> ${result.feet.standard} feet</p>
        <p><strong>Millimeters:</strong> ${result.millimeters.standard} mm</p>
        <p><strong>Centimeters:</strong> ${result.centimeters.standard} cm</p>
        <p><strong>Meters:</strong> ${result.meters.standard} m</p>
      `;
    })
    .catch(err => console.error('Error fetching data: ', err));
});
