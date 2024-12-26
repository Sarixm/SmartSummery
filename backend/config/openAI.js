import { AzureOpenAI } from "openai";
import Groq from "groq-sdk";

//This function prints to the screen with the current time
function logWithTimestamp(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}
//The template of the form
export const medicalTemplate = {
  patientDetails: {
    idOrPassport: "",
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    city: "",
    street: "",
    houseNumber: "",
    phone: "",
    email: "",
  },
  smartData: {
    findings: {
      diagnosis: "",
      patientStatus: "",
      mainComplaint: "",
      anamnesis: "",
      medicalSensitivities: "",
      statusWhenFound: "",
      CaseFound: "",
    },
    medicalMetrics: {
      bloodPressure: { value: "", time: "" },
      "Heart Rate": "",
      "Lung Auscultation": "",
      consciousnessLevel: "",
      breathingRate: "",
      breathingCondition: "",
      skinCondition: "",
      lungCondition: "",
      CO2Level: "",
    },
  },
};

//The Whissper Ai connection object
const Whissper = {
  endpoint:
    "https://bakur-m52vpsgt-swedencentral.openai.azure.com/openai/deployments/whisper/audio/transcriptions?api-version=2024-06-01",
  apiKey:
    "7vwrlTuBlvTSTJ8AqFj2JbCZZhjkM2LslT8bNKldnJbu2qMNwdiZJQQJ99ALACfhMk5XJ3w3AAAAACOG16Ho",
};
// Required Azure OpenAI deployment name and API version
const apiVersion = "2024-08-01-preview";
const deploymentName = "whisper";

//The fieled auto fill Ai connection object
const groq = new Groq({
  apiKey: "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",
});

function getWhissperClient() {
  return new AzureOpenAI({
    endpoint: Whissper.endpoint,
    apiKey: Whissper.apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

//Getting the values from the Ai filed in the JSON fields
async function getJsonFieldsFilled(txt) {
  logWithTimestamp("Step Five: Connecting to Groq -> llama3 Model ...");
  logWithTimestamp("Step Six: Processing form filling ...");
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
You are a medical data extraction system.
Given a trascript which simulates a trascript of a medical call, Extract information from the Hebrew transcript and fill the medical form template.
the template is a json object which is structured like that:
${medicalTemplate}
Return a JSON object and only a JSON object because im taking the result and converting into JSON object, dont provide any comments and if u really need put it in a new JSON key-value pair called "notations", which matching the template structure with extracted values which fit the template's fields context.
Make sure to fit the values properly to thier field's
Use empty string for missing information.
All values should be in Hebrew.
If you dont know the values, please write that u dont know to analye is rather to say random values

I have a specifcal request about the "anamnesis" field, dont skip it! ITS IMPORTANT:
Create a detailed medical anamnesis by organizing the provided information as follows: start with patient identification, then describe symptom timeline and progression, state the chief complaint, list relevant medical history and medications, detail current status including vital signs, and end with treatments given and patient response. Use professional medical language and present as flowing paragraphs.
Here is an example of an trascript and a good response which i request from you to provide:
The trascript:
יוסי מאיחוד הצלה. שלום, מה שלומך? איך אני יכול לעזור לך? אני מרגיש לחץ חזק בחזה, זה התחיל לפני בערך חצי שעה. שם מלא בבקשה. חיים לוי. תעודת זהות? 123456789. בן כמה אתה? 58. כתובת? רחוב הרצל 25, ירושלים. האם יש לך רקע רפואי כלשהו או מחלות רקע? כן, יש לי סוכרת ולחץ דם גבוה. האם אתה נוטל תרופות? כן, גלוקומין ולוסרטן. האם אתה מעשן? כן, בערך קופסה ביום. האם יש לך אלרגיות לתרופות או חומרים אחרים? לא. אתה זוכר מתי הייתה הפעם האחרונה שאכלת או שתית? אכלתי ארוחת בוקר בערך בשמונה בבוקר, שתיתי קפה לפני שעה. הלחץ בחזה מלווה בהקרנה ליד שמאל או ללסת? כן, זה מקרין ליד שמאל וללסת.
האם אתה מרגיש סחרחורת או קוצר נשימה? כן, יש לי תחושת סחרחורת וקצת קשה לי לנשום. האם יש לך היסטוריה של בעיות בלב או התקף לב? לא, אף פעם לא היה לי התקף לב. האם זה התחיל תוך כדי מאמץ או במנוחה? זה התחיל בזמן שהייתי במנוחה, ישבתי בבית על הספה. האם אתה מרגיש כאב נוסף או תופעות נלוות אחרות? כן, אני מרגיש חולשה חזקה וזיעה קרה.
בדיקת מדדים: לחץ דם 145/95. דופק 110. רמת סוכר 210. חמצן בדם 92%. המטופל במצב יציב אך נראה סובל מאוד.

The response in JSON which im expecting you to deliver:

{
  "patientDetails": {
    "idOrPassport": "123456789",
    "firstName": "חיים",
    "lastName": "לוי",
    "age": "58",
    "gender": "זכר",
    "city": "ירושלים",
    "street": "הרצל",
    "houseNumber": "25",
    "phone": "",
    "email": ""
  },
  "smartData": {
    "findings": {
      "diagnosis": "חשד לאירוע לבבי",
      "patientStatus": "יציב אך סובל",
      "mainComplaint": "לחץ חזק בחזה עם הקרנה ליד שמאל וללסת",
      "anamnesis": "חיים לוי, בן 58, פנה עקב תחושת לחץ חזק בחזה שהחלה במנוחה, עם הקרנה ליד שמאל וללסת, מלווה בסחרחורת, קוצר נשימה, חולשה וזיעה קרה. רקע רפואי כולל סוכרת ולחץ דם גבוה, מעשן כקופסה ביום, לוקח גלוקומין ולוסרטן. בדיקות: לחץ דם 145/95, דופק 110, סוכר 210, סטורציה 92%.",
      "medicalSensitivities": "אין רגישויות ידועות",
      "statusWhenFound": "תעוקת חזה",
      "CaseFound": "חשד לאירוע לבבי"
    },
    "medicalMetrics": {
      "bloodPressure": { "value": "145/95", "time": "" },
      "Heart Rate": "110",
      "Lung Auscultation": "תקין",
      "consciousnessLevel": "מלאה",
      "breathingRate": "לא ידוע",
      "breathingCondition": "קוצר נשימה",
      "skinCondition": "מזיע זיעה קרה", 
      "lungCondition": "",
      "CO2Level": "92"
    }
  }
}
        `,
      },
      {
        role: "user",
        content: `Here is the transcript which im requesting from you to provide the JSON by its values: ${txt}`,
      },
    ],
    model: "llama3-8b-8192",
  });
  logWithTimestamp("Step Seven: Form data been recived succefully ...");
  return completion.choices[0].message.content;
}

async function FinalVersionFormFilled(trans) {
  try {
    logWithTimestamp("Step Five: Connecting to Groq -> llama3 Model ...");
    logWithTimestamp("Step Six: Processing form filling ...");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are about to get a hebrew speech of an indevidual about a medical event, it would include values of the following subjects:
Full name,
(Israeli)Id
(In israel)City
Allergies - (Either does he have an allergie or not)
Type of pain
blood presure

im expecting you to return a JSON formated response which the keys would be the fields and the corresponding values for the keys would fit the fields
Here is the structure of the JSON repsonse file:
{
  "name": "",
  "age": "",
  "id": "",
  "city": "",
  "allergies": "",
  "pain": "",
  "bloodPressure": ""
}

The values that you'll expect from the request would be categorized by the fields
here is the dataset for each field, the options are saparated by the | sign:

name: דניאל כהן | משה גת | יוסי לוי | דן בנט
age: 20 | 13 | 47 | 60
id:  1234 | 6758 | 4879 | 5193
city: ירושלים | צפת | אשקלון | תל אביב
allergies: כן | לא
pain: ראש | כתף | יד שבורה | דימום
bloodPressure:  180/40 | 160/70 | 120/35 | 90/130

To help you analize better the given request, here are two samples of speechs that you'll might recive and the response json that im expecting you to deliver in these cases

Case 1:
The Request
שלום, מה השם שלך דניאל כהן בן כמה אתה 20 תעודת זהות בבקשה? 1234 מאיפה אתה ירושלים יש לך אלרגיות כלשהן כן איפה כואב לך בכתף
לחץ הדם שלך נמדד, זה 160 על 70 בסדר תודה, אני אעביר את המידע לצוות
The expected response:
{
  "name": "דניאל כהן",
  "age": 20,
  "id": "1234",
  "city": "ירושלים",
  "allergies": "כן",
  "pain": "כתף",
  "bloodPressure": "160/70"
}

Case 2:
The reqeust
שלום, מה השם שלך משה גת בן כמה אתה 13 תעודת זהות בבקשה 4879 מאיפה אתה צפת יש לך אלרגיות כלשהן לא
איפה כואב לך בראש לחץ הדם שלך נמדד זה 120 על 35 בסדר תודה אני אעביר את המידע לצוות
The expected response
  {
    "name": "משה גת",
    "age": 13,
    "id": 4879,
    "city": "צפת",
    "allergies": "לא",
    "pain": "ראש",
    "bloodPressure": "120/35"
  },
Make sure that all the fields including the keys and the values are in string type and not an int
        `,
        },
        {
          role: "user",
          content: `Here is the transcript which im requesting from you to provide the JSON by its values: ${trans}`,
        },
      ],
      model: "llama3-8b-8192",
    });
    logWithTimestamp("Step Seven: Form data been recived succefully ...");
    return completion.choices[0].message.content;
  } catch (e) {
    console.log(e);
  }
}

//Converting to a valid value
function formatModelResponse(modelResponse) {
  try {
    // Initialize response structure
    let formattedResponse = {
      response: {},
    };

    // Split response by newlines to separate JSON and notes
    const lines = modelResponse.split("\n");
    let jsonStartIndex = -1;
    let jsonEndIndex = -1;
    let noteCounter = 65; // ASCII for 'A'

    // Find JSON boundaries
    lines.forEach((line, index) => {
      if (line.trim().startsWith("{")) jsonStartIndex = index;
      if (line.trim().endsWith("}")) jsonEndIndex = index;
    });

    // Extract and parse JSON
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      const jsonString = lines
        .slice(jsonStartIndex, jsonEndIndex + 1)
        .join("\n");
      formattedResponse.response = JSON.parse(jsonString);
    }

    // Add notes
    lines.forEach((line, index) => {
      if (index < jsonStartIndex || index > jsonEndIndex) {
        const trimmedLine = line.trim();
        if (
          trimmedLine &&
          !trimmedLine.startsWith("{") &&
          !trimmedLine.endsWith("}")
        ) {
          formattedResponse[`Note${String.fromCharCode(noteCounter)}`] =
            trimmedLine;
          noteCounter++;
        }
      }
    });

    return JSON.stringify(formattedResponse, null, 2);
  } catch (error) {
    throw new Error(`Failed to format response: ${error.message}`);
  }
}

export {
  getWhissperClient,
  formatModelResponse,
  getJsonFieldsFilled,
  logWithTimestamp,
  FinalVersionFormFilled,
};
