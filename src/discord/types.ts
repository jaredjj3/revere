import { Client } from 'discord.js';

export type DiscordClientProvider = () => Promise<Client>;
