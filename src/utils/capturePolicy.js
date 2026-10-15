function shouldCapture(policy, serverId, channelId, pokemonName) {
  const server = policy?.servers?.[serverId];
  if (!server) return true;

  const channel = server.channels?.[channelId];
  if (!channel) return true;

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
