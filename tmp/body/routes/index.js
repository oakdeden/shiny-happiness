var express = require('express');
var router = express.Router();

/* GET home page with BMI input form */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Body Mass Index (BMI) Calculator',
    height: '',
    weight: '',
    showReset: false,
    error: null
  });
});

/* GET /calculate */
router.get('/calculate', function(req, res, next) {
  var rawHeight = req.query.height;
  var rawWeight = req.query.weight;

  // Validate presence of inputs
  if (rawHeight === undefined || rawWeight === undefined || String(rawHeight).trim() === '' || String(rawWeight).trim() === '') {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: rawHeight || '',
      weight: rawWeight || '',
      showReset: Boolean(rawHeight || rawWeight),
      error: 'Please enter both height in meters and weight in kilograms.'
    });
  }

  // Read form data from the query request
  const height = parseFloat(rawHeight);
  const weight = parseFloat(rawWeight);

  // Validate numeric values and positivity
  if (isNaN(height) || isNaN(weight) || height <= 0 || weight <= 0) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: rawHeight,
      weight: rawWeight,
      showReset: true,
      error: 'Please enter valid positive numbers for height and weight.'
    });
  }

  // Do the math to calculate the BMI: const bmi = weight / (height * height)
  const bmi = weight / (height * height);

  // Category determination
  var category = '';
  var categoryClass = '';
  var description = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    categoryClass = 'underweight';
    description = 'Your BMI is below 18.5, indicating you may be underweight.';
  } else if (bmi < 25.0) {
    category = 'Normal weight';
    categoryClass = 'normal';
    description = 'Your BMI is in the healthy weight range (18.5 - 24.9).';
  } else if (bmi < 30.0) {
    category = 'Overweight';
    categoryClass = 'overweight';
    description = 'Your BMI is between 25.0 and 29.9, which is considered overweight.';
  } else {
    category = 'Obese';
    categoryClass = 'obese';
    description = 'Your BMI is 30.0 or higher, falling into the obesity category.';
  }

  // Render the second template with a placeholder for the calculated BMI into two decimal places
  const templateName = req.query.template || 'results';
  res.render(templateName, {
    title: 'BMI Calculation Result',
    bmi: bmi.toFixed(2),
    height: height,
    weight: weight,
    category: category,
    categoryClass: categoryClass,
    isUnderweight: categoryClass === 'underweight',
    isNormal: categoryClass === 'normal',
    isOverweight: categoryClass === 'overweight',
    isObese: categoryClass === 'obese',
    description: description
  });
});

module.exports = router;
