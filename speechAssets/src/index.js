// Data on each car manufacturer
var cars = {
    "bmw" : {
        "country_of_origin" : "germany",
        "most_popular_model" : "320D"
    },
    "nissan" : {
        "country_of_origin" : "japan",
        "most_popular_model" : "juke"
    },
    "mitsubishi" : {
        "country_of_origin" : "japan",
        "most_popular_model" : "lancer"
    },
    "suzuki" : {
        "country_of_origin" : "japan",
        "most_popular_model" : "splash"
    },
    "volkswagen" : {
        "country_of_origin" : "germany",
        "most_popular_model" : "golf"
    },
    "toyota" : {
        "country_of_origin" : "japan",
        "most_popular_model" : "yaris"
    },
    "tesla" : {
        "country_of_origin" : "america",
        "most_popular_model" : "model 3"
    },
    "honda" : {
        "country_of_origin" : "japan",
        "most_popular_model" : "civic"
    },
    "mazda" : {
        "country_of_origin" : "japan",
        "most_popular_model" : "rx7"
    },
    "ford" : {
        "country_of_origin" : "america",
        "most_popular_model" : "focus"
    }
};

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // dispatch custom intents to handlers here
    if (intentName == "CarIntent") {

        handleCarResponse(intent, session, callback)

    } else if (intentName == "AMAZON.YesIntent") { 

        handleYesResponse(intent, session, callback)

    } else if (intentName == "AMAZON.NoIntent") {

        handleNoResponse(intent, session, callback)

    } else if (intentName == "AMAZON.HelpIntent") {

        handleGetHelpRequest(intent, session, callback)

    } else if (intentName == "AMAZON.StopIntent") {

        handleFinishSessionRequest(intent, session, callback)

    } else if (intentName == "AMAZON.CancelIntent") {

        handleFinishSessionRequest(intent, session, callback)

    } else {
        throw "Invalid intent"
    }
}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "Welcome to Car Facts! Do you want to hear some facts about car manufacturers: " + 
                       "BMW, Nissan, Mitsubishi, Suzuki, Volkswagen, Toyota, Tesla, Honda, Mazda and Ford." +
                       "I can only give facts about one at a time." + 
                       "Which car manufacturer are you interested in?"

    var reprompt = "Do you want to hear about some car facts? You can find out about BMW, Nissan, Mitsubishi, Suzuki, Volkswagen, Toyota, Tesla, Honda, Mazda and Ford."

    var header = "Car Facts!"

    // We should not end the skill session becasue we just started the session. 
    var shouldEndSession = false

    // Holds some attributes that we might want to access later on. Could hold previous user requests in memory in the session attributes.
    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession))

}

function handleCarResponse(intent, session, callback) {

    var car = intent.slots.Car.value.toLowerCase()

    if (!cars[car]) {

        var speechOutput = "That car manufactuer is not very famous. Try asking about another like, BMW, Nissan, Mitsubishi, Suzuki, Volkswagen, Toyota, Tesla, Honda, Mazda or Ford."
        var repromptText = "Try asking about another car"
        var header = "Not Famous enough"

    } else {

        var country_of_origin = cars[car].country_of_origin
        var most_popular_model = cars[car].most_popular_model
        var speechOutput = capitalizeFirst(car) + " " + country_of_origin + " and " + most_popular_model + ". Do you want to hear about more cars."
        var repromptText = "Do you want to hear about more cars?"
        var header = capitalizeFirst(car)

    }

    var shouldEndSession = false

    callback(session.attributes, buildSpeechletResponse(header, speechOutput, repromptText, shouldEndSession))
}

function handleYesResponse(intent, session, callback) {
    var speechOutput = "Great! Which car? You can find out about BMW, Nissan, Mitsubishi, Suzuki, Volkswagen, Toyota, Tesla, Honda, Mazda or Ford."
    var repromptText = speechOutput
    var shouldEndSession = false 

    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

function handleNoResponse(intent, session, callback) {
    handleFinishSessionRequest(intent, session, callback)
}

function handleFinishSessionRequest(intent, session, callback) {
    // Ends the session with a Good Bye
    callback(session.attributes, buildSpeechletResponseWithoutCard("Good bye! Thank you for using car facts!", "", true));
}

function handleGetHelpRequest(intent, session, callback) {
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    var speechOutput = "I can tell you about all the famous car manufactures: " +
                       "BMW, Nissan, Mitsubishi, Suzuki, Volkswagen, Toyota, Tesla, Honda, Mazda and Ford." +
                       "Which car are you interested in? Remember, I can only give facts about one car at a time. ";

    var repromptText = speechOutput;
    var shouldEndSession = false;
    callback(session.attributes, buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession))
}

// ------- Helper functions to build responses for Alexa -------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function capitalizeFirst(s) {
    // Captilizing the first character and returning the rest of the car.
    return s.charAt(0).toUpperCase() + s.slice(1)
}