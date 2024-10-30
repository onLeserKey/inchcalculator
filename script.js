document.getElementById('calculatorForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const toggleKeypadBtn = document.getElementById('toggle-keypad-btn');
  toggleKeypadBtn.focus();
  const expression = document.getElementById('expressionInput').value;
  const encodedExpression = encodeURIComponent(expression);
  const apiUrl = `https://www.inchcalculator.com/api/calculators/feet-and-inches/?uc_length=${encodedExpression}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const result = data.results;

      // Clear previous results
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '';  // Clear previous results

      // Function to sanitize HTML and insert a non-breaking space before the first <span>
      function sanitizeHtml(html) {
        const tempDiv = document.createElement('div');
        let cleanHtml = html;
        if (html.indexOf(' <span class="inch-fraction') == -1) {
          cleanHtml = html.replace('<span class="inch-fraction', ' <span class="inch-fraction');
        }
        tempDiv.innerHTML = cleanHtml.trim();
        return tempDiv.textContent || tempDiv.innerText || '';
      }

      // Function to round fractions to nearest 1/8, 1/4, or 1/2
      function roundFraction(fraction) {
        let [numerator, denominator] = fraction.split('/').map(Number);
        const targetDenominator = 8;
        const denominators = [128, 64, 32, 16, 8, 4, 2];

        if (denominator > targetDenominator) {
          let nextCheck = 0;
          let candidateNumerator = numerator + nextCheck;
          let candidateDomenator = 0.0;
          let foundNumeratorCandidate = 0;
          let foundDomenator = denominator;
          let diff = 0.0;
          let bestDiff = 0.0;

          while (candidateNumerator < denominator && candidateNumerator > 0 && foundNumeratorCandidate == 0) {
            nextCheck++
            for (let i = 0; i < denominators.length; i++) {
              let nextDomenator = denominators[i];
              candidateDomenator = denominator / nextDomenator;
              if (candidateDomenator > targetDenominator) continue;

              candidateNumerator = numerator + nextCheck;
              diff = candidateNumerator / nextDomenator - Math.round(candidateNumerator / nextDomenator);
              
              if (diff == 0) {
                foundNumeratorCandidate = candidateNumerator;
                foundDomenator = nextDomenator;
                break;
              }

              candidateNumerator = numerator - nextCheck;
              diff = candidateNumerator / nextDomenator - Math.round(candidateNumerator / nextDomenator);
              if (diff == 0) {
                foundNumeratorCandidate = candidateNumerator;
                foundDomenator = nextDomenator;
                break;
              }
            }
            if (foundNumeratorCandidate != 0) {
              numerator = foundNumeratorCandidate / foundDomenator;
              denominator = denominator / foundDomenator;
              break;
            }
          }
                    
          return `${numerator}/${denominator}`;
        }

        return fraction;
      }

      // Function to handle complex measurements with feet, inches, and fractions
      function roundMeasurement(measurement) {
        measurement = sanitizeHtml(measurement);
        const feetInchesRegex = /(?:(?:(?<Feet>\d+)[ ]*(?:'|ft)){0,1}[ ]*(?<Inches>\d*(?![\/\w])){0,1}(?:[ ,\-]){0,1}(?<Fraction>(?<FracNum>\d*)\/(?<FracDem>\d*)){0,1}(?<Decimal>\.\d*){0,1}(?:\x22| in))|(?:(?<Feet2>\d+)[ ]*(?:'|ft)[ ]*){1}/;
        const match = measurement.match(feetInchesRegex);

        if (match) {
          let feet = match[1] ? match[1] + "'" : '';
          let inches = match[2] ? match[2] : '';
          let fraction = match[3] ? match[3] : '';

          if (fraction) {
            fraction = roundFraction(fraction);
            if (fraction == "1/1") {
              fraction = "";
              inches = parseInt("0"+inches) + 1;
              if (inches==12 /*&& feet!=""*/) {
                inches = "";
                feet = parseInt("0"+feet) + 1 + "'";
              }
            }
          }

          let result = `${feet} ${inches}`;
          if (fraction) {
            result += ` ${fraction}"`;
          } else if (inches) {
            result += '"';
          }

          return result.trim();
        }

        return measurement;
      }

      // Function to create result items and sanitize the value if needed
      function createResultItem(label, value, sanitize = false) {
        const p = document.createElement('p');
        const strongLabel = document.createElement('strong');
        strongLabel.textContent = label;

        const spanValue = document.createElement('span');
        const cleanValue = sanitize ? sanitizeHtml(value) : value;
        spanValue.textContent = ` ${cleanValue} `;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy';
        copyButton.className = 'copy-btn';
        copyButton.setAttribute('data-copy', cleanValue);

        copyButton.addEventListener('click', function () {
          navigator.clipboard.writeText(cleanValue).then(() => {
            alert(`Copied to clipboard: ${cleanValue}`);
          }).catch(err => {
            console.error('Error copying to clipboard', err);
          });
        });

        p.appendChild(copyButton);
        p.appendChild(strongLabel);
        p.appendChild(spanValue);
        

        resultDiv.appendChild(p);

        return cleanValue;
      }

      // Create and append each result item (sanitize only those with HTML)
      createResultItem('Imperial:', result.display_value, true);

      // Add a second display for the rounded fraction
      const roundedMeasurement = roundMeasurement(result.display_value);
      createResultItem('Rounded:', roundedMeasurement);
      const inches = createResultItem('Inches & fractions:', result.inches.fraction + "\"", true);
      createResultItem('Rounded:', roundMeasurement(inches), true);
      createResultItem('Decimal Inches:', result.inches.standard.replace(",", ""));
      createResultItem('Decimal Inches:', result.inches.precision.replace(",", ""));
      createResultItem('Decimal Feet:', result.feet.standard.replace(",", ""));
      createResultItem('Decimal Feet:', result.feet.precision.replace(",", ""));
      createResultItem('Millimeters:', result.millimeters.standard.replace(",",""));
      //createResultItem('Millimeters:', result.millimeters.precision.replace(",",""));
      createResultItem('Centimeters:', result.centimeters.standard.replace(",", ""));
      //createResultItem('Centimeters:', result.centimeters.precision.replace(",", ""));
      createResultItem('Meters:', result.meters.standard.replace(",", ""));
      createResultItem('Meters:', result.meters.precision.replace(",", ""));
    })
    .catch(err => console.error('Error fetching data: ', err));
});



// Keypad Functions
document.addEventListener('DOMContentLoaded', function () {
  const expressionInput = document.getElementById('expressionInput');
  const keypadContainer = document.getElementById('keypad-container');
  const toggleKeypadBtn = document.getElementById('toggle-keypad-btn');
  const calculateBtn = document.getElementById('calculate-btn');

  // Toggle between phone keyboard and custom keypad
  toggleKeypadBtn.addEventListener('click', function () {
    if (keypadContainer.style.display === 'none') {
      calculateBtn.style.display = "none";
      keypadContainer.style.display = 'block';
      toggleKeypadBtn.textContent = 'Hide Keypad';
      expressionInput.blur(); // Hides the phone keyboard
    } else {
      calculateBtn.style.display = "block";
      keypadContainer.style.display = 'none';
      toggleKeypadBtn.textContent = 'Show Keypad';
    }
  });

  // Keypad button functionality
  document.querySelectorAll('.keypad-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.getAttribute('data-key') || '';
      let cursorPos = expressionInput.value.length; // expressionInput.selectionStart;
      let currentText = expressionInput.value;

      switch (key) {
        case 'backspace':
          // Remove the last character
          expressionInput.value = currentText.slice(0, cursorPos - 1) + currentText.slice(cursorPos);
          expressionInput.setSelectionRange(cursorPos - 1, cursorPos - 1);
          break;
        case 'clear':
          if (confirm('Are you sure you want to clear the screen?')) {
            expressionInput.value = '';
          }
          break;
        case 'space':
          expressionInput.setRangeText(' ', cursorPos, cursorPos, 'end');
          break;
        default:
          expressionInput.setRangeText(key, cursorPos, cursorPos, 'end');
          break;
      }
    });
  });
});


