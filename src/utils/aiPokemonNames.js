const { getName } = require("pokehint");

const AI_NAME_EXCEPTIONS = {
  "Mime Jr_": "Mime Jr.",
  "Type": "Type: Null",
};

async function canonicalizeAiPokemonName(name) {
  const inputName = AI_NAME_EXCEPTIONS[name] || name;

  return getName({
    name: inputName,
    language: "English",
  });
}

module.exports = {
  canonicalizeAiPokemonName,
};
