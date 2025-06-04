import {dbConnection} from './mongoConnections.js';

/* This will allow you to have one reference to each collection per app */
/* Feel free to copy and paste this this */
const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
export const users = getCollectionFn('users');
export const posts = getCollectionFn('posts');
export const comments = getCollectionFn('comments');
export const media = getCollectionFn('media');