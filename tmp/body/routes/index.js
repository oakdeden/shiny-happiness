var express = require('express');
var router = express.Router();

/**
 * GET home page
 * Displays the BMI calculation form.
 */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Body Mass Index (BMI) Calculator',
    height: '',
    weight: '',
    bmi: null,
    category: null,
    categoryClass: '',
    description: '',
    error: null
  });
});

/**
 * GET /calculate
 * Calculates BMI based on query parameters: height (meters) and weight (kg).
 * Performs comprehensive input validation and error handling.
 */
router.get('/calculate', function(req, res, next) {
  var rawHeight = req.query.height;
  var rawWeight = req.query.weight;

  // Check if query params are completely missing
  if (rawHeight === undefined && rawWeight === undefined) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: '',
      weight: '',
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Please enter your height and weight to calculate your BMI.'
    });
  }

  var trimmedHeight = (rawHeight !== undefined && rawHeight !== null) ? String(rawHeight).trim() : '';
  var trimmedWeight = (rawWeight !== undefined && rawWeight !== null) ? String(rawWeight).trim() : '';

  // Validate missing fields
  if (trimmedHeight === '' && trimmedWeight === '') {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: '',
      weight: '',
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Both height in meters and weight in kilograms are required.'
    });
  }

  if (trimmedHeight === '') {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: '',
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Height in meters is required.'
    });
  }

  if (trimmedWeight === '') {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: '',
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Weight in kilograms is required.'
    });
  }

  // Parse numerical values
  var height = parseFloat(trimmedHeight);
  var weight = parseFloat(trimmedWeight);

  // Validate numerical correctness
  if (isNaN(height) || !isFinite(height)) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Height must be a valid number (e.g. 1.75).'
    });
  }

  if (isNaN(weight) || !isFinite(weight)) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Weight must be a valid number (e.g. 68.5).'
    });
  }

  // Check positive non-zero values
  if (height <= 0) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Height must be a positive number greater than 0.'
    });
  }

  if (weight <= 0) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Weight must be a positive number greater than 0.'
    });
  }

  // Check realistic physiological bounds
  if (height < 0.3 || height > 3.0) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Please enter a realistic height between 0.3 and 3.0 meters.'
    });
  }

  if (weight < 1.0 || weight > 700.0) {
    return res.render('index', {
      title: 'Body Mass Index (BMI) Calculator',
      height: trimmedHeight,
      weight: trimmedWeight,
      bmi: null,
      category: null,
      categoryClass: '',
      description: '',
      error: 'Please enter a realistic weight between 1.0 and 700.0 kilograms.'
    });
  }

  // Calculate BMI: weight / (height * height)
  var bmiVal = weight / (height * height);
  var bmiFormatted = bmiVal.toFixed(2);

  var category = '';
  var categoryClass = '';
  var description = '';

  if (bmiVal < 18.5) {
    category = 'Underweight';
    categoryClass = 'underweight';
    description = 'Your BMI is below 18.5, which falls into the underweight category. A healthcare provider can help assess your nutritional intake and overall health.';
  } else if (bmiVal < 25.0) {
    category = 'Normal weight';
    categoryClass = 'normal';
    description = 'Your BMI is in the healthy weight range (18.5 - 24.9). Continuing a balanced diet and regular physical activity will help maintain overall wellness.';
  } else if (bmiVal < 30.0) {
    category = 'Overweight';
    categoryClass = 'overweight';
    description = 'Your BMI is between 25.0 and 29.9, which is considered overweight. Eating a nutrient-dense diet and engaging in regular exercise can support positive health outcomes.';
  } else {
    category = 'Obese';
    categoryClass = 'obese';
    description = 'Your BMI is 30.0 or higher, categorized as obesity. We recommend consulting with a medical professional or nutritionist for personalized guidance.';
  }

  res.render('index', {
    title: 'Body Mass Index (BMI) Calculator',
    height: trimmedHeight,
    weight: trimmedWeight,
    bmi: bmiFormatted,
    category: category,
    categoryClass: categoryClass,
    description: description,
    error: null
  });
});

module.exports = router;
