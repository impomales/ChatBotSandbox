const axios = require('axios');

// intents
const HELP = 'Help';
const GREETING = 'Greeting';
const REVIEW_LANDLORD = 'ReviewLandlord';
const TODAYS_WEATHER = 'TodaysWeather';

// sources
const DIALOG_CODE_HOOK = 'DialogCodeHook';
const FULFILLMENT_CODE_HOOK = 'FulfillmentCodeHook';

// statuses
const CONFIRMED = 'Confirmed';
const DENIED = 'Denied';
const NONE = 'None';
const FULFILLED = 'Fulfilled';
const FAILED = 'Failed';

// response types
const CLOSE = 'Close';
const CONFIRM_INTENT = 'ConfirmIntent';
const ELICIT_SLOT = 'ElicitSlot';
const ELICIT_INTENT = 'ElicitIntent';
const DELEGATE = 'Delegate';

// slot types
const TITLE = 'Title';
const MONTHLY_RENT = 'MonthlyRent';
const LANDLORD_NAME = 'LandlordName';
const TIME_LIVING = 'TimeLiving';
const OVERALL_EXPERIENCE = 'OverallExperience';
const RESPONSIVE = 'Responsive';
const LOCATION = 'Location';
const COMMENTS = 'Comments';

// helper functions
function kelvinToFahrenheit(temp) {
  return Math.round((1.8 * (temp - 273) + 32) * 100) / 100;
}

// response objects

// expects no response from user.
function close(sessionAttributes, fulfillmentState, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: CLOSE,
      fulfillmentState,
      message: {
        contentType: 'PlainText',
        content: message,
      },
    },
  };
}

// expecting user to respond 'yes' or 'no' to confirm intent.
function confirmIntent(sessionAttributes, intentName, slots, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: CONFIRM_INTENT,
      intentName,
      slots,
      message: {
        contentType: 'PlainText',
        content: message,
      },
    },
  };
}

// expecting user to provide a slot value
function elicitSlot(
  sessionAttributes,
  intentName,
  slots,
  slotToElicit,
  message
) {
  return {
    sessionAttributes,
    dialogAction: {
      type: ELICIT_SLOT,
      intentName,
      slots,
      slotToElicit,
      message: {
        contentType: 'PlainText',
        content: message,
      },
    },
  };
}

function elicitIntent(sessionAttributes, message) {
  return {
    sessionAttributes,
    dialogAction: {
      type: ELICIT_INTENT,
      message: {
        contentType: 'PlainText',
        content: message,
      },
    },
  };
}

// choose next course of action on bot config.
function delegate(sessionAttributes, slots) {
  return {
    sessionAttributes,
    dialogAction: {
      type: DELEGATE,
      slots,
    },
  };
}

// validators

function validationResult(isValid, violatedSlot, message) {
  return {
    isValid,
    violatedSlot,
    message: {
      constentType: 'PlainText',
      content: message,
    },
  };
}

function validateReviewLandlord(slots) {
  // slot validations.
}

// intent handlers

function handleHelp(request) {
  const slots = request.currentIntent.slots;
  const source = request.invocationSource;
  const sessionAttributes = request.sessionAttributes;

  if (source === FULFILLMENT_CODE_HOOK) {
    // invokes review landlord intent if users confirms.
    return confirmIntent(
      sessionAttributes,
      REVIEW_LANDLORD,
      {
        [TITLE]: null,
        [TIME_LIVING]: null,
        [MONTHLY_RENT]: null,
        [LANDLORD_NAME]: null,
        [OVERALL_EXPERIENCE]: null,
        [RESPONSIVE]: null,
        [COMMENTS]: null
      },
      'I can help you review your landlord. Would you like to write a review?'
    );
  }
}

function handleGreeting(request) {
  const slots = request.currentIntent.slots;
  const source = request.invocationSource;
  const sessionAttributes = request.sessionAttributes;

  if (source === FULFILLMENT_CODE_HOOK) {
    sessionAttributes.UserName = slots.UserName; // attr to persists throught session.
    return elicitIntent(
      sessionAttributes,
      `HI ${slots.UserName}, How can I help?`
    );
  }
}

function handleReviewLandlord(request) {
  const confirmationStatus = request.currentIntent.confirmationStatus;
  const slots = request.currentIntent.slots;
  const source = request.invocationSource;
  const sessionAttributes = request.sessionAttributes;

  if (confirmationStatus === DENIED) {
    return close(sessionAttributes, FULFILLED, 'Ok, Have a nice day!');
  }

  // initialization/validations
  if (source === DIALOG_CODE_HOOK) {
    // conditional dialog.
    if (
      !slots.Responsive &&
      slots.OverallExperience &&
      slots.OverallExperience === 'Negative'
    ) {
      return elicitSlot(
        sessionAttributes,
        REVIEW_LANDLORD,
        slots,
        RESPONSIVE,
        `Did ${slots.LandlordName} respond to you within 24 hours?`
      );
    }

    return delegate(sessionAttributes, slots);
  }

  // confirmations/fulfillment
  if (source === FULFILLMENT_CODE_HOOK) {
    // make API Call here.

    let username = sessionAttributes.UserName;
    if (username) username = ', ' + username;
    else username = '';

    return close(
      sessionAttributes,
      FULFILLED,
      `Thank you${username}, your review has been posted.`
    );
  }
}

function handleTodaysWeather(request) {
  const slots = request.currentIntent.slots;
  const source = request.invocationSource;
  const sessionAttributes = request.sessionAttributes;

  if (source === DIALOG_CODE_HOOK) {
    if (!slots.Location) {
      return elicitSlot(sessionAttributes, TODAYS_WEATHER, slots, LOCATION, `Please enter  a city.`);
    }
  }

  if (source === FULFILLMENT_CODE_HOOK) {
    // api call to get weather for specified city.
    return axios
      .get(
        `http://api.openweathermap.org/data/2.5/weather?q=${
          slots.Location
        },us&appid=${process.env.WEATHER_API}`
      )
      .then(res => res.data)
      .then(data => {
        let username = sessionAttributes.UserName;
        if (username) username = ', ' + username;
        else username = '';
        return close(sessionAttributes, FULFILLED, `Today${username}, it is ${kelvinToFahrenheit(data.main.temp)} °F in ${data.name}. ${data.weather[0].description}.`);
      })
      .catch(err => {
        console.error(err);
        return elicitSlot(sessionAttributes, TODAYS_WEATHER, slots, LOCATION, `Sorry, invalid city. Try again.`);
      });
  }
}

function dispatch(request) {
  const intentName = request.currentIntent.name;

  switch (intentName) {
    case HELP:
      return handleHelp(request);
    case GREETING:
      return handleGreeting(request);
    case REVIEW_LANDLORD:
      return handleReviewLandlord(request);
    case TODAYS_WEATHER:
      return handleTodaysWeather(request);
    default:
      throw Error(`Intent with name ${intentName} not supported.`);
  }
}

exports.handler = async (request) => {
  return dispatch(request);
};
