const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");
const cors = require('cors')({ origin: true });

exports.getImageAnnotations = functions.https.onRequest(
    async (req, res) => {
        cors(req, res, async () => {
            const client = new vision.ImageAnnotatorClient();
            try {
                const imageBase64 = req.body.image;
                const request = {
                    image: {
                        content: Buffer.from(imageBase64.split("base64,")[1], 'base64')
                    }
                };
                const [result] = await client.labelDetection(request);
                const annotations = result.labelAnnotations;
                res.send(annotations);
            } catch (error) {
                console.error(error);
                res.send(error);
            }
        })
    }
);