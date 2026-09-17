function shouldCapture(policy, serverId, channelId, pokemonName) {
  const server = policy?.servers?.[serverId];
  if (!server) return false;

  const channel = server.channels?.[channelId];
  if (!channel) return false;

  const normalizedPokemon = String(pokemonName ?? "").trim().toLowerCase();
  if (!normalizedPokemon) return false;

  const blacklist = Array.isArray(channel.blacklist)
    ? channel.blacklist
    : [];

  return !blacklist.some(
    (name) => String(name).trim().toLowerCase() === normalizedPokemon
  );
}

module.exports = {
  shouldCapture,
};
