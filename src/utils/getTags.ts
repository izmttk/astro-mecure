import type { Tag } from "@/types";
import getPosts from "./getPosts";

async function getTags(): Promise<Tag[]> {
    const posts = await getPosts();
    return posts.flatMap(post => post.tags).filter((tag, index, arr) => {
        return arr.findIndex(item => item.label === tag.label) === index;
    });
}

export default getTags;