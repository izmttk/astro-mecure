import type { Category } from '@/types';
import getPosts from './getPosts';

let cache: Category[] | null = null;
async function getCategories(): Promise<Category[]> {
    if (cache !== null) {
        return cache;
    }
    const posts = (await getPosts()).filter(post => !post.draft);
    cache = posts.flatMap(post => post.category).filter((category, index, arr) => {
        return arr.findIndex(item => item.label === category.label) === index;
    });
    return cache;
}

export default getCategories;