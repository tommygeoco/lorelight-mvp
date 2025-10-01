/**
 * Hilarious D&D-themed loading messages for use throughout the app
 * Use getRandomLoadingMessage() to get a random message
 */

export const LOADING_MESSAGES = [
  "Rolling for initiative...",
  "Consulting the ancient scrolls...",
  "Summoning a familiar...",
  "Casting Detect Magic...",
  "Bribing the town guard...",
  "Avoiding eye contact with the beholder...",
  "Checking for traps...",
  "Looting the dragon's hoard...",
  "Persuading the DM...",
  "Rolling a natural 1...",
  "Rolling a natural 20!",
  "Arguing about alignment...",
  "Buying more dice...",
  "Identifying mysterious potions...",
  "Attuning to magic items...",
  "Resting at the tavern...",
  "Feeding the gelatinous cube...",
  "Debating spell slots...",
  "Avoiding the mimic...",
  "Consulting with the party...",
  "Drawing from the Deck of Many Things...",
  "Taming a dire wolf...",
  "Bartering with kobolds...",
  "Deciphering the riddle...",
  "Dodging the boulder trap...",
  "Intimidating the goblin...",
  "Seducing the dragon...",
  "Polymorphing the wizard...",
  "Resurrecting the bard...",
  "Sharpening the vorpal blade...",
  "Tuning the lute...",
  "Cleaning the bag of holding...",
  "Organizing the spell components...",
  "Petting the owlbear...",
  "Sneaking past the lich...",
  "Haggling with the merchant...",
  "Reading the prophecy...",
  "Lighting the torches...",
  "Mapping the dungeon...",
  "Befriending the orc...",
  "Escaping the gelatinous cube...",
  "Dispelling the illusion...",
  "Translating ancient runes...",
  "Preparing the ritual...",
  "Enchanting equipment...",
  "Communing with the deity...",
  "Searching for secret doors...",
  "Divining the future...",
  "Negotiating with demons...",
  "Questioning the DM's decisions...",
] as const

export type LoadingMessage = typeof LOADING_MESSAGES[number]

/**
 * Get a random loading message from the list
 */
export function getRandomLoadingMessage(): LoadingMessage {
  return LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
}

/**
 * Get multiple unique random loading messages
 * @param count Number of messages to return (max: LOADING_MESSAGES.length)
 */
export function getRandomLoadingMessages(count: number): LoadingMessage[] {
  const shuffled = [...LOADING_MESSAGES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, LOADING_MESSAGES.length))
}
