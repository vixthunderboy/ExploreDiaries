import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

export const createPostIndex = async (post) => {
  try {
    await client.index({
      index: 'posts',
      body: {
        title: post.title,
        content: post.content,
        category: post.category,
        location: post.location,
        createdAt: post.createdAt,
      },
    });
    console.log(`Post indexed in Elasticsearch: ${post.title}`);
  } catch (error) {
    console.error("Error indexing post in Elasticsearch:", error);
  }
};