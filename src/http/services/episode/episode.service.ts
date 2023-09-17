export class EpisodeService {
  async getEpisode(model: any, id: string) {
    const findEpisode = await model.findOne(
      { "chapters.episodes._id": id },
      { "chapters.episodes.$": 1 }
    );

    return findEpisode?.chapters?.[0]?.episodes?.[0];
  }
}
