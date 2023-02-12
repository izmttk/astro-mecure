import type { Category } from "../types";
import getPosts from "./getPosts";

async function getCategories(): Promise<Category[]> {
    const posts = await getPosts();
    return posts.flatMap(post => post.category).filter((category, index, arr) => {
        return arr.findIndex(item => item.label === category.label) === index;
    });
}

export default getCategories;