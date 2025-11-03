import PostModal from "@/components/PostModal";

export default async function SinglePostPage({ params } : { params: Promise<{ postId: string }> }) {
    const { postId } = await params;

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <PostModal postId={Number(postId)} fullPage />
        </div>
    );
}
