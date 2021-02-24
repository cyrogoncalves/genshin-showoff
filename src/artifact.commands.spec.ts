import { Artifact } from './model';
import { ArtifactCommands } from './artifact.commands';
import { APIMessageContentResolvable, Message, MessageAdditions, MessageOptions } from 'discord.js';

const godlyArtifact: Artifact = {
  set: 'Crimson', // Crimson Witch of Flames
  // exp: 270475,
  level: 20,
  type: 'Flower',
  rarity: 5,
  mainStat: 'HP',
  subStats: {
    'CR': 15.6,
    'CD': 23.4,
    'ATK%': 5.8,
    'ER': 6.5
  }
};

const mockMessage = {
  channel: {
    send: (
        content: APIMessageContentResolvable | (MessageOptions & { split?: false }) | MessageAdditions,
    ): Promise<Message> => null
  }
} as Message;

describe('ArtifactCommands', () => {
  it('add', () => {
    const cmd = "-showoff artifact set=Crimson rarity=5 level=20 type=Flower substats=CR:15.6|CD:23.4|ATK%:5.8|ER:6.5";
    const art = ArtifactCommands.add(mockMessage, cmd.split(/\s+/).slice(2));
    expect(art).toEqual(godlyArtifact);
  });
});