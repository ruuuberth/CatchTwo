const fs = require("fs");
const path = require("path");
const tf = require("@tensorflow/tfjs");

async function loadLocalLayersModel(modelPath) {
  const modelJson = JSON.parse(
    fs.readFileSync(modelPath, "utf8")
  );

  const modelDir = path.dirname(modelPath);
  const weightsPath = path.join(
    modelDir,
    modelJson.weightsManifest[0].paths[0]
  );

  const weightData = fs.readFileSync(weightsPath);

  return tf.loadLayersModel(
    tf.io.fromMemory({
      modelTopology: modelJson.modelTopology,
      weightSpecs: modelJson.weightsManifest[0].weights,
      weightData: weightData.buffer.slice(
        weightData.byteOffset,
        weightData.byteOffset + weightData.byteLength
      ),
    })
  );
}

module.exports = {
  loadLocalLayersModel,
};
