import type { Tag } from '@/types';
import getPosts from './getPosts';

let cache: Tag[] | null = null;
async function getTags(): Promise<Tag[]> {
    if (cache !== null) {
        return cache;
    }
    const posts = (await getPosts()).filter(post => !post.draft);
    cache = posts.flatMap(post => post.tags).filter((tag, index, arr) => {
        return arr.findIndex(item => item.label === tag.label) === index;
    });
    return cache;
}

export default getTags;